import logging
import cv2
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance
import gc
from typing import Dict, Tuple, Any, List, Union
import os
import urllib.request
from pathlib import Path

logger = logging.getLogger(__name__)


class ImageProcessingError(Exception):
    """Custom exception for image processing errors."""
    pass


class LaMaLiteModel:
    """Lightweight LaMa-inspired model for CPU inference"""
    
    def __init__(self, model_path: str = None):
        """Initialize LaMa Lite model
        
        Args:
            model_path: Path to ONNX model file. If None, will download automatically.
        """
        self.model_path = model_path
        self.session = None
        self.model_loaded = False
        self.input_size = 512  # Standard LaMa input size
        
        # Model URLs - Enlaces REALES verificados
        self.model_urls = {
            # RECOMENDADO: Versión FP32 (funciona mejor)
            "lama_fp32": "https://huggingface.co/Carve/LaMa-ONNX/resolve/main/lama_fp32.onnx",
            
            # Alternativa: Versión original PyTorch
            "lama_pytorch": "https://github.com/advimman/lama/releases/download/main/big-lama.zip",
            
            # Backup: Modelo compacto
            "lama_lite": "https://huggingface.co/Carve/LaMa-ONNX/resolve/main/lama_fp32.onnx",
        }
        
    def _download_model(self, model_name: str = "lama_lite") -> str:
        """Download LaMa model if not exists"""
        models_dir = Path("./models")
        models_dir.mkdir(exist_ok=True)
        
        model_file = models_dir / f"{model_name}.onnx"
        
        if model_file.exists():
            # Verificar que el archivo no esté corrupto
            try:
                import onnx
                onnx.load(str(model_file))
                logger.info(f"Model {model_name} already exists and is valid")
                return str(model_file)
            except:
                logger.warning(f"Model {model_name} exists but is corrupted, re-downloading...")
                os.remove(str(model_file))
        
        try:
            logger.info(f"Downloading {model_name} model...")
            url = self.model_urls.get(model_name)
            if not url:
                raise ValueError(f"Unknown model: {model_name}")
            
            # Headers para descargas de HuggingFace
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req) as response:
                with open(str(model_file), 'wb') as f:
                    f.write(response.read())
            
            # Verificar que se descargó correctamente
            file_size = os.path.getsize(str(model_file))
            if file_size < 1024 * 1024:  # < 1MB
                os.remove(str(model_file))
                raise ValueError(f"Downloaded file too small: {file_size} bytes")
            
            logger.info(f"Model downloaded successfully: {model_file} ({file_size:,} bytes)")
            return str(model_file)
            
        except Exception as e:
            logger.error(f"Failed to download model: {e}")
            return None
    
    def load_model(self) -> bool:
        """Load LaMa ONNX model for CPU inference"""
        try:
            import onnxruntime as ort
            
            # Download model if needed
            if not self.model_path:
                self.model_path = self._download_model("lama_lite")
            
            if not self.model_path or not os.path.exists(self.model_path):
                logger.warning("LaMa model not found, falling back to OpenCV")
                return False
            
            # Configure ONNX Runtime for CPU
            providers = ['CPUExecutionProvider']
            sess_options = ort.SessionOptions()
            sess_options.intra_op_num_threads = 4
            sess_options.inter_op_num_threads = 4
            sess_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
            
            self.session = ort.InferenceSession(
                self.model_path,
                providers=providers,
                sess_options=sess_options
            )
            
            self.model_loaded = True
            logger.info("LaMa model loaded successfully for CPU inference")
            return True
            
        except ImportError:
            logger.warning("ONNX Runtime not installed. Install with: pip install onnxruntime")
            return False
        except Exception as e:
            logger.error(f"Failed to load LaMa model: {e}")
            return False
    
    def preprocess(self, image: np.ndarray, mask: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """VERSIÓN CORREGIDA del preprocessing"""
        h, w = image.shape[:2]
        
        # Calculate resize ratio
        scale = min(self.input_size / w, self.input_size / h)
        new_w, new_h = int(w * scale), int(h * scale)
        
        # Resize
        image_resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_LINEAR)
        mask_resized = cv2.resize(mask, (new_w, new_h), interpolation=cv2.INTER_NEAREST)
        
        # Pad
        pad_w = self.input_size - new_w
        pad_h = self.input_size - new_h
        
        image_padded = cv2.copyMakeBorder(
            image_resized, 0, pad_h, 0, pad_w, cv2.BORDER_REFLECT
        )
        mask_padded = cv2.copyMakeBorder(
            mask_resized, 0, pad_h, 0, pad_w, cv2.BORDER_CONSTANT, value=0
        )
        
        # *** FIX CRÍTICO 1: Conversión correcta ***
        image_rgb = cv2.cvtColor(image_padded, cv2.COLOR_BGR2RGB)
        image_norm = image_rgb.astype(np.float32) / 255.0
        
        # *** FIX CRÍTICO 2: Máscara correcta para LaMa ***
        # LaMa espera: 1 = remover, 0 = conservar
        # Tu máscara actual tiene 255 donde remover, así que:
        mask_binary = (mask_padded > 127).astype(np.float32)  # Esto está CORRECTO
        
        # Convert to tensors
        image_tensor = np.transpose(image_norm, (2, 0, 1))[np.newaxis, ...]
        mask_tensor = mask_binary[np.newaxis, np.newaxis, ...]
        
        return image_tensor, mask_tensor, (h, w), (new_h, new_w), (pad_h, pad_w)

    
    def postprocess(self, output: np.ndarray, original_size: Tuple[int, int], 
                     new_size: Tuple[int, int], padding: Tuple[int, int]) -> np.ndarray:
        """VERSIÓN CORREGIDA del postprocessing"""
        
        # Convert from [1, C, H, W] to [H, W, C]
        if len(output.shape) == 4:
            output = np.transpose(output[0], (1, 2, 0))
        elif len(output.shape) == 3:
            output = np.transpose(output, (1, 2, 0))
        
        # *** FIX CRÍTICO 3: Verificar rango del output ***
        print(f"Output range: {output.min():.3f} to {output.max():.3f}")
        
        # Manejar diferentes rangos de salida del modelo
        if output.max() <= 1.0:
            # Output en [0, 1]
            output = np.clip(output * 255.0, 0, 255).astype(np.uint8)
        elif output.min() >= -1.0 and output.max() <= 1.0:
            # Output en [-1, 1]
            output = np.clip((output + 1.0) * 127.5, 0, 255).astype(np.uint8)
        else:
            # Output ya en [0, 255]
            output = np.clip(output, 0, 255).astype(np.uint8)
        
        # Remove padding
        pad_h, pad_w = padding
        if pad_h > 0:
            output = output[:-pad_h, :]
        if pad_w > 0:
            output = output[:, :-pad_w]
        
        # Resize back
        original_h, original_w = original_size
        output = cv2.resize(output, (original_w, original_h), interpolation=cv2.INTER_LINEAR)
        
        # Convert RGB back to BGR
        if len(output.shape) == 3 and output.shape[2] == 3:
            output_bgr = cv2.cvtColor(output, cv2.COLOR_RGB2BGR)
        else:
            output_bgr = output
        
        return output_bgr
        
    def inpaint(self, image: np.ndarray, mask: np.ndarray) -> np.ndarray:
        """VERSIÓN CORREGIDA de la inferencia"""
        if not self.model_loaded or not self.session:
            raise RuntimeError("LaMa model not loaded")
        
        # *** FIX CRÍTICO 4: Validar inputs ***
        print(f"Input image shape: {image.shape}, dtype: {image.dtype}")
        print(f"Input mask shape: {mask.shape}, dtype: {mask.dtype}")
        print(f"Mask unique values: {np.unique(mask)}")
        
        # Preprocess
        image_tensor, mask_tensor, orig_size, new_size, padding = self.preprocess(image, mask)
        
        # *** FIX CRÍTICO 5: Debug tensors ***
        print(f"Image tensor - shape: {image_tensor.shape}, range: {image_tensor.min():.3f} to {image_tensor.max():.3f}")
        print(f"Mask tensor - shape: {mask_tensor.shape}, range: {mask_tensor.min():.3f} to {mask_tensor.max():.3f}")
        
        # Get model info
        inputs_info = self.session.get_inputs()
        outputs_info = self.session.get_outputs()
        
        print(f"Model expects {len(inputs_info)} inputs:")
        for i, inp in enumerate(inputs_info):
            print(f"  Input {i}: {inp.name}, shape: {inp.shape}, type: {inp.type}")
        
        print(f"Model produces {len(outputs_info)} outputs:")
        for i, out in enumerate(outputs_info):
            print(f"  Output {i}: {out.name}, shape: {out.shape}, type: {out.type}")
        
        # Prepare inputs
        input_names = [inp.name for inp in inputs_info]
        
        if len(input_names) == 2:
            # Separate inputs
            inputs = {
                input_names[0]: image_tensor,
                input_names[1]: mask_tensor
            }
        elif len(input_names) == 1:
            # *** FIX CRÍTICO 6: Verificar el orden de concatenación ***
            # Algunos modelos esperan [image, mask], otros [mask, image]
            # Probar ambas versiones:
            try:
                # Versión 1: [image, mask]
                concatenated = np.concatenate([image_tensor, mask_tensor], axis=1)
                inputs = {input_names[0]: concatenated}
                print(f"Trying concatenated input [image, mask]: {concatenated.shape}")
            except:
                # Versión 2: [mask, image] 
                concatenated = np.concatenate([mask_tensor, image_tensor], axis=1)
                inputs = {input_names[0]: concatenated}
                print(f"Trying concatenated input [mask, image]: {concatenated.shape}")
        
        # Run inference
        try:
            outputs = self.session.run(None, inputs)
            output = outputs[0]
            print(f"Inference successful - output shape: {output.shape}, range: {output.min():.3f} to {output.max():.3f}")
            
            # *** FIX CRÍTICO 7: Validar que el output no sea todo blanco ***
            if output.mean() > 0.95:  # Si el promedio es muy alto (blanco)
                print("WARNING: Output seems to be mostly white!")
                print(f"Output stats - mean: {output.mean():.3f}, std: {output.std():.3f}")
                
        except Exception as e:
            print(f"Inference failed: {e}")
            raise
        
        # Postprocess
        result = self.postprocess(output, orig_size, new_size, padding)
        
        # *** FIX CRÍTICO 8: Validación final ***
        print(f"Final result - shape: {result.shape}, range: {result.min()} to {result.max()}")
        
        return result


class CPUObjectRemover:
    """LaMa-inspired CPU Object Remover with fallback methods"""

    def __init__(self, use_lama: bool = True, model_path: str = None):
        """Initialize with LaMa model option
        
        Args:
            use_lama: Whether to use LaMa model (requires onnxruntime)
            model_path: Path to custom LaMa ONNX model
        """
        self.use_lama = use_lama
        self.lama_model = None
        
        if use_lama:
            try:
                self.lama_model = LaMaLiteModel(model_path)
                success = self.lama_model.load_model()
                if not success:
                    logger.warning("Failed to load LaMa model, using OpenCV fallback")
                    self.use_lama = False
                    self.lama_model = None
            except Exception as e:
                logger.warning(f"LaMa initialization failed: {e}, using OpenCV fallback")
                self.use_lama = False
                self.lama_model = None
        
        logger.info(f"CPU Object Remover initialized - LaMa: {self.use_lama}")

    def _create_mask_from_coordinates(self, 
                                    coordinates: List[Dict[str, Union[int, float]]], 
                                    image_width: int, 
                                    image_height: int) -> np.ndarray:
        """Create mask from frontend coordinates - FIXED VERSION"""
        mask = np.zeros((image_height, image_width), dtype=np.uint8)
        
        logger.info(f"Creating mask from {len(coordinates)} coordinate sets")
        
        for coord_set in coordinates:
            if isinstance(coord_set, dict):
                if all(key in coord_set for key in ['x', 'y', 'width', 'height']):
                    x = int(coord_set['x'])
                    y = int(coord_set['y'])
                    width = int(coord_set['width'])
                    height = int(coord_set['height'])
                    
                    # Ensure within bounds
                    x = max(0, min(x, image_width - 1))
                    y = max(0, min(y, image_height - 1))
                    width = min(width, image_width - x)
                    height = min(height, image_height - y)
                    
                    cv2.rectangle(mask, (x, y), (x + width, y + height), 255, -1)
                    
                elif 'x' in coord_set and 'y' in coord_set:
                    x = int(coord_set['x'])
                    y = int(coord_set['y'])
                    
                    x = max(0, min(x, image_width - 1))
                    y = max(0, min(y, image_height - 1))
                    
                    radius = max(15, min(image_width, image_height) // 50)
                    cv2.circle(mask, (x, y), radius, 255, -1)

        # *** FIX IMPORTANTE: Mejor procesamiento de máscara ***
        # Dilate mask ligeramente para mejor cobertura
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        mask = cv2.dilate(mask, kernel, iterations=2)
        
        # *** NUEVO: Suavizar bordes de la máscara ***
        # Esto es crucial para evitar artefactos en los bordes
        mask = cv2.GaussianBlur(mask, (7, 7), 2.0)
        
        # Volver a binarizar después del blur
        _, mask = cv2.threshold(mask, 127, 255, cv2.THRESH_BINARY)
        
        logger.info(f"Mask created with {np.sum(mask > 0)} pixels to inpaint")
        return mask

    def _lama_inpainting(self, image: np.ndarray, mask: np.ndarray) -> np.ndarray:
        """LaMa-based inpainting"""
        logger.info("Using LaMa model for inpainting")
        try:
            result = self.lama_model.inpaint(image, mask)
            return result
        except Exception as e:
            logger.error(f"LaMa inpainting failed: {e}")
            # Fallback to OpenCV
            return self._opencv_inpainting(image, mask)

    def _opencv_inpainting(self, image: np.ndarray, mask: np.ndarray) -> np.ndarray:
        """Enhanced OpenCV inpainting as fallback - MEJORADO"""
        logger.info("Using enhanced OpenCV inpainting")
        
        # *** MEJORA 1: Usar múltiples métodos y combinar ***
        # TELEA para texturas finas
        result_telea = cv2.inpaint(image, mask, 7, cv2.INPAINT_TELEA)
        
        # NS (Navier-Stokes) para regiones grandes
        result_ns = cv2.inpaint(image, mask, 7, cv2.INPAINT_NS)
        
        # *** MEJORA 2: Combinar ambos métodos ***
        # Usar máscara suavizada para combinar
        mask_float = mask.astype(np.float32) / 255.0
        mask_smooth = cv2.GaussianBlur(mask_float, (21, 21), 7)
        mask_smooth = np.expand_dims(mask_smooth, axis=2)
        
        # Combinar: TELEA para detalles, NS para regiones grandes
        combined = (result_telea.astype(np.float32) * (1 - mask_smooth) + 
                   result_ns.astype(np.float32) * mask_smooth)
        
        result = np.clip(combined, 0, 255).astype(np.uint8)
        
        # *** MEJORA 3: Post-procesamiento ***
        # Aplicar filtro bilateral para suavizar pero mantener bordes
        result = cv2.bilateralFilter(result, 9, 75, 75)
        
        return result

    def _blend_with_original(self, original: np.ndarray, inpainted: np.ndarray, 
                           mask: np.ndarray) -> np.ndarray:
        """Seamlessly blend inpainted result with original - MEJORADO"""
        # *** MEJORA: Mejor blending para evitar artefactos ***
        
        # Crear máscara suavizada más grande para transición gradual
        mask_float = mask.astype(np.float32) / 255.0
        
        # Erosionar ligeramente la máscara para preservar más del original
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        mask_eroded = cv2.erode(mask, kernel, iterations=1)
        mask_eroded_float = mask_eroded.astype(np.float32) / 255.0
        
        # Crear gradiente suave en los bordes
        mask_blurred = cv2.GaussianBlur(mask_eroded_float, (21, 21), 8)
        mask_blurred = np.expand_dims(mask_blurred, axis=2)
        
        # Aplicar función de suavizado exponencial
        mask_feathered = np.power(mask_blurred, 0.6)
        
        # Blend con transición más suave
        result = (original.astype(np.float32) * (1 - mask_feathered) + 
                 inpainted.astype(np.float32) * mask_feathered)
        
        return np.clip(result, 0, 255).astype(np.uint8)

    def _enhance_result(self, image: np.ndarray) -> np.ndarray:
        """Post-processing enhancement - MEJORADO"""
        pil_image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
        
        # *** MEJORA 1: Reducción de ruido más efectiva ***
        # Usar filtro más suave pero efectivo
        pil_image = pil_image.filter(ImageFilter.MedianFilter(size=3))
        
        # *** MEJORA 2: Ajuste sutil de contraste ***
        enhancer = ImageEnhance.Contrast(pil_image)
        pil_image = enhancer.enhance(1.02)
        
        # *** MEJORA 3: Sharpening muy sutil ***
        enhancer = ImageEnhance.Sharpness(pil_image)
        pil_image = enhancer.enhance(1.01)
        
        # Convert back
        enhanced = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
        return enhanced

    def process(self, 
               input_image: np.ndarray, 
               coordinates: List[Dict[str, Union[int, float]]],
               config: Dict[str, Any] = None) -> np.ndarray:
        """Main processing function - MEJORADO"""
        if config is None:
            config = {}
            
        try:
            original_h, original_w = input_image.shape[:2]
            logger.info(f"Processing object removal: {original_w}x{original_h}")
            
            # Create mask
            mask = self._create_mask_from_coordinates(coordinates, original_w, original_h)
            
            if np.sum(mask > 0) == 0:
                logger.warning("Empty mask - returning original image")
                return input_image
            
            # *** DEBUG: Verificar que la máscara no sea completamente blanca ***
            mask_coverage = np.sum(mask > 0) / (original_w * original_h)
            logger.info(f"Mask covers {mask_coverage:.2%} of the image")
            
            if mask_coverage > 0.8:  # Si cubre más del 80%
                logger.warning("Mask covers too much of the image, reducing...")
                # Erosionar máscara muy grande
                kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (10, 10))
                mask = cv2.erode(mask, kernel, iterations=3)
            
            # Choose inpainting method
            if self.use_lama and self.lama_model and config.get('use_lama', True):
                result = self._lama_inpainting(input_image, mask)
                method_used = "lama"
            else:
                result = self._opencv_inpainting(input_image, mask)
                method_used = "opencv"
            
            # *** MEJORA CRÍTICA: Verificar que el resultado no sea blanco ***
            result_mean = np.mean(result)
            if result_mean > 240:  # Imagen muy blanca
                logger.warning("Result too bright, adjusting...")
                # Usar solo blending sin el resultado de inpainting
                result = self._opencv_inpainting(input_image, mask)
                method_used = f"{method_used}_fallback"
            
            # Blend with original for seamless result
            if config.get('seamless_blend', True):
                result = self._blend_with_original(input_image, result, mask)
            
            # Post-processing enhancement
            if config.get('enhance', True):
                result = self._enhance_result(result)
            
            logger.info(f"Object removal completed using {method_used}")
            return result
            
        except Exception as e:
            logger.error(f"Object removal failed: {e}")
            # Emergency fallback - más conservador
            try:
                mask = self._create_mask_from_coordinates(coordinates, input_image.shape[1], input_image.shape[0])
                # Reducir máscara en emergencia
                kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
                mask = cv2.erode(mask, kernel, iterations=2)
                return cv2.inpaint(input_image, mask, 5, cv2.INPAINT_TELEA)
            except:
                return input_image

    def cleanup(self):
        """Clean up resources"""
        if self.lama_model:
            self.lama_model.session = None
            self.lama_model = None
        gc.collect()
        logger.info("CPU processor cleanup completed")


# Main function
# Main function
async def perform_object_removal(
    job_id: str,
    image_url: str,
    config: Dict[str, Any]
) -> Tuple[str, Dict[str, Any]]:
    """LaMa-inspired object removal for CPU"""
    
    processor = None
    
    try:
        from app.cloudinary_service import CloudinaryService
        
        # Download image
        logger.info(f"Downloading image for job {job_id}")
        image_bytes = CloudinaryService.download_image_from_url(image_url)
        
        nparr = np.frombuffer(image_bytes, np.uint8)
        input_image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if input_image is None:
            raise ValueError("Failed to decode image")
        
        coordinates = config.get('coordinates', [])
        if not coordinates:
            raise ValueError("No coordinates provided")
        
        # Initialize processor with LaMa option
        use_lama = config.get('use_lama', True)
        model_path = config.get('lama_model_path', None)
        
        processor = CPUObjectRemover(use_lama=use_lama, model_path=model_path)
        
        # *** MEJORA: Configuración más conservadora por defecto ***
        enhanced_config = {
            'seamless_blend': True,
            'enhance': True,
            'use_lama': config.get('use_lama', True),  # Usar OpenCV por defecto
            **config
        }
        
        # Process
        output_image = processor.process(input_image, coordinates, enhanced_config)
        
        # Determine method used
        if processor.use_lama and processor.lama_model:
            processing_method = "lama_cpu"
            model_used = "lama_lite_onnx"
        else:
            processing_method = "opencv_enhanced_cpu"
            model_used = "opencv_telea_ns_combined"
        
        # Encode result
        encode_params = [cv2.IMWRITE_PNG_COMPRESSION, 6]
        is_success, buffer = cv2.imencode('.png', output_image, encode_params)
        
        if not is_success:
            raise RuntimeError("Failed to encode output image")
        
        output_bytes = buffer.tobytes()
        
        # Create thumbnail
        h, w = output_image.shape[:2]
        thumb_scale = min(300 / w, 300 / h, 1.0)
        
        if thumb_scale < 1.0:
            new_w = int(w * thumb_scale)
            new_h = int(h * thumb_scale)
            thumbnail = cv2.resize(output_image, (new_w, new_h), interpolation=cv2.INTER_AREA)
        else:
            thumbnail = output_image.copy()
        
        is_success, thumb_buffer = cv2.imencode('.png', thumbnail)
        thumbnail_bytes = thumb_buffer.tobytes()
        
        # Upload to Cloudinary
        processed_url, processed_public_id = CloudinaryService.upload_processed_image(
            output_bytes, job_id, "object_removal"
        )
        
        thumbnail_url, thumbnail_public_id = CloudinaryService.upload_thumbnail(
            thumbnail_bytes, job_id
        )
        
        # Processing info
        processing_info = {
            "processing_type": "object_removal",
            "model": model_used,
            "method": processing_method,
            "ai_enhanced": processor.use_lama and processor.lama_model is not None,
            "objects_removed": len(coordinates),
            "coordinates_processed": coordinates,
            "original_size": f"{input_image.shape[1]}x{input_image.shape[0]}",
            "output_size": f"{output_image.shape[1]}x{output_image.shape[0]}",
            "full_quality_public_id": processed_public_id,
            "thumbnail_public_id": thumbnail_public_id,
            "thumbnail_url": thumbnail_url,
            "device_used": "cpu",
            "processing_method": processing_method,
            "config_used": enhanced_config
        }
        
        logger.info(f"Job {job_id} completed - Method: {processing_method}")
        return processed_url, processing_info
        
    except Exception as e:
        logger.error(f"Job {job_id} failed: {e}")
        raise
        
    finally:
        if processor:
            processor.cleanup()
        gc.collect()