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
    """LaMa-inspired CPU Object Remover with enhanced large object handling"""

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
        
        

    def _analyze_mask_complexity(self, mask: np.ndarray, image_shape: Tuple[int, int]) -> Dict[str, Any]:
        """Analyze mask to determine best processing strategy"""
        h, w = image_shape[:2]
        total_pixels = h * w
        mask_pixels = np.sum(mask > 0)
        coverage_ratio = mask_pixels / total_pixels
        
        # Find connected components
        num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(mask, connectivity=8)
        components = []
        
        for i in range(1, num_labels):  # Skip background (label 0)
            area = stats[i, cv2.CC_STAT_AREA]
            x, y, width, height = stats[i, cv2.CC_STAT_LEFT], stats[i, cv2.CC_STAT_TOP], stats[i, cv2.CC_STAT_WIDTH], stats[i, cv2.CC_STAT_HEIGHT]
            aspect_ratio = width / height if height > 0 else 1.0
            
            components.append({
                'area': area,
                'bbox': (x, y, width, height),
                'aspect_ratio': aspect_ratio,
                'relative_area': area / total_pixels
            })
        
        # Sort by area (largest first)
        components.sort(key=lambda x: x['area'], reverse=True)
        
        # Determine complexity
        is_large_object = coverage_ratio > 0.15  # More than 15% of image
        is_complex_scene = len(components) > 3 or (len(components) > 1 and coverage_ratio > 0.25)
        largest_component_ratio = components[0]['relative_area'] if components else 0
        
        return {
            'coverage_ratio': coverage_ratio,
            'num_components': len(components),
            'components': components,
            'is_large_object': is_large_object,
            'is_complex_scene': is_complex_scene,
            'largest_component_ratio': largest_component_ratio,
            'strategy': self._determine_strategy(coverage_ratio, len(components), largest_component_ratio)
        }

    def _determine_strategy(self, coverage_ratio: float, num_components: int, largest_ratio: float) -> str:
        """Determine the best processing strategy based on mask analysis"""
        if coverage_ratio > 0.4:
            return "extreme_large"  # Very large areas
        elif coverage_ratio > 0.2 or largest_ratio > 0.15:
            return "large_object"   # Large single objects
        elif num_components > 4:
            return "multiple_small" # Many small objects
        elif num_components > 1 and coverage_ratio > 0.1:
            return "complex_scene"  # Multiple medium objects
        else:
            return "simple"         # Simple, small objects

    def _create_mask_from_coordinates(self, 
                                    coordinates: List[Dict[str, Union[int, float]]], 
                                    image_width: int, 
                                    image_height: int) -> np.ndarray:
        """Create mask from frontend coordinates with improved large object handling"""
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

        return mask

    def _process_mask_for_strategy(self, mask: np.ndarray, strategy: str) -> np.ndarray:
        """Process mask according to the determined strategy"""
        
        if strategy == "extreme_large":
            # For very large objects, be more conservative
            # Erode significantly to avoid removing too much
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
            mask = cv2.erode(mask, kernel, iterations=3)
            
            # Add gradual dilation to create soft edges
            for i in range(3):
                kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5 + i*2, 5 + i*2))
                mask = cv2.dilate(mask, kernel, iterations=1)
            
        elif strategy == "large_object":
            # For large objects, moderate processing
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
            mask = cv2.erode(mask, kernel, iterations=1)
            mask = cv2.dilate(mask, kernel, iterations=2)
            
        elif strategy == "complex_scene":
            # For complex scenes, be more precise
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
            mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
            mask = cv2.dilate(mask, kernel, iterations=1)
            
        else:  # simple or multiple_small
            # Original processing for simple cases
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
            mask = cv2.dilate(mask, kernel, iterations=2)
        
        # Apply Gaussian blur with strategy-specific parameters
        blur_params = {
            "extreme_large": (15, 5.0),
            "large_object": (11, 3.0),
            "complex_scene": (7, 2.0),
            "simple": (7, 2.0),
            "multiple_small": (5, 1.5)
        }
        
        kernel_size, sigma = blur_params.get(strategy, (7, 2.0))
        mask = cv2.GaussianBlur(mask, (kernel_size, kernel_size), sigma)
        
        # Re-binarize
        _, mask = cv2.threshold(mask, 127, 255, cv2.THRESH_BINARY)
        
        return mask

    def _segment_large_mask(self, mask: np.ndarray, max_segment_size: int = 256) -> List[Tuple[np.ndarray, Tuple[int, int, int, int]]]:
        """Segment large mask into smaller, overlapping patches for better processing"""
        h, w = mask.shape
        segments = []
        
        # Calculate optimal segment size and overlap
        overlap = max_segment_size // 4
        step_size = max_segment_size - overlap
        
        for y in range(0, h, step_size):
            for x in range(0, w, step_size):
                # Define segment boundaries
                x1, y1 = x, y
                x2, y2 = min(x + max_segment_size, w), min(y + max_segment_size, h)
                
                # Extract segment
                segment_mask = mask[y1:y2, x1:x2]
                
                # Only process segments that contain mask pixels
                if np.sum(segment_mask > 0) > 0:
                    segments.append((segment_mask, (x1, y1, x2, y2)))
        
        return segments

    def _lama_inpainting_large_object(self, image: np.ndarray, mask: np.ndarray, strategy: str) -> np.ndarray:
        """Enhanced LaMa inpainting for large objects"""
        logger.info(f"Using LaMa model for large object inpainting - Strategy: {strategy}")
        
        try:
            h, w = image.shape[:2]
            
            if strategy == "extreme_large" and (h > 1024 or w > 1024 or np.sum(mask > 0) / (h * w) > 0.3):
                # Use segmented approach for very large objects
                logger.info("Using segmented approach for extreme large object")
                return self._lama_segmented_inpainting(image, mask)
            else:
                # Direct approach for manageable large objects
                result = self.lama_model.inpaint(image, mask)
                return result
                
        except Exception as e:
            logger.error(f"LaMa large object inpainting failed: {e}")
            return self._opencv_inpainting_large_object(image, mask, strategy)

    def _lama_segmented_inpainting(self, image: np.ndarray, mask: np.ndarray) -> np.ndarray:
        """Process very large masks using segmented approach"""
        h, w = image.shape[:2]
        result = image.copy()
        
        # Create segments
        segments = self._segment_large_mask(mask, max_segment_size=512)
        
        logger.info(f"Processing {len(segments)} segments for large object removal")
        
        for i, (segment_mask, (x1, y1, x2, y2)) in enumerate(segments):
            # Extract image segment
            segment_image = image[y1:y2, x1:x2]
            
            try:
                # Process segment
                segment_result = self.lama_model.inpaint(segment_image, segment_mask)
                
                # Blend back into result with feathering
                self._blend_segment_back(result, segment_result, segment_mask, (x1, y1, x2, y2))
                
            except Exception as e:
                logger.warning(f"Segment {i} failed with LaMa, using OpenCV: {e}")
                # Fallback to OpenCV for this segment
                segment_result = cv2.inpaint(segment_image, segment_mask, 7, cv2.INPAINT_TELEA)
                self._blend_segment_back(result, segment_result, segment_mask, (x1, y1, x2, y2))
        
        return result

    def _blend_segment_back(self, result: np.ndarray, segment_result: np.ndarray, 
                           segment_mask: np.ndarray, bbox: Tuple[int, int, int, int]):
        """Blend a processed segment back into the main result"""
        x1, y1, x2, y2 = bbox
        
        # Create feathering mask for smooth blending
        feather_mask = segment_mask.astype(np.float32) / 255.0
        feather_mask = cv2.GaussianBlur(feather_mask, (21, 21), 7)
        
        # Handle edge feathering to avoid artifacts at segment boundaries
        seg_h, seg_w = segment_result.shape[:2]
        edge_fade = 20  # pixels to fade at edges
        
        # Top edge fade
        if y1 > 0:
            fade = np.linspace(0, 1, edge_fade)[:, np.newaxis]
            feather_mask[:edge_fade] *= fade
        
        # Bottom edge fade  
        if y2 < result.shape[0]:
            fade = np.linspace(1, 0, edge_fade)[:, np.newaxis]
            feather_mask[-edge_fade:] *= fade
        
        # Left edge fade
        if x1 > 0:
            fade = np.linspace(0, 1, edge_fade)[np.newaxis, :]
            feather_mask[:, :edge_fade] *= fade
        
        # Right edge fade
        if x2 < result.shape[1]:
            fade = np.linspace(1, 0, edge_fade)[np.newaxis, :]
            feather_mask[:, -edge_fade:] *= fade
        
        # Expand mask for RGB blending
        if len(segment_result.shape) == 3:
            feather_mask = np.expand_dims(feather_mask, axis=2)
        
        # Blend
        original_segment = result[y1:y2, x1:x2].astype(np.float32)
        blended = (original_segment * (1 - feather_mask) + 
                  segment_result.astype(np.float32) * feather_mask)
        
        result[y1:y2, x1:x2] = np.clip(blended, 0, 255).astype(np.uint8)

    def _opencv_inpainting_large_object(self, image: np.ndarray, mask: np.ndarray, strategy: str) -> np.ndarray:
        """Enhanced OpenCV inpainting specifically for large objects"""
        logger.info(f"Using enhanced OpenCV inpainting for large objects - Strategy: {strategy}")
        
        # Strategy-specific parameters
        inpaint_params = {
            "extreme_large": {"radius": 15, "method1": cv2.INPAINT_NS, "method2": cv2.INPAINT_TELEA},
            "large_object": {"radius": 10, "method1": cv2.INPAINT_NS, "method2": cv2.INPAINT_TELEA},
            "complex_scene": {"radius": 7, "method1": cv2.INPAINT_TELEA, "method2": cv2.INPAINT_NS},
        }
        
        params = inpaint_params.get(strategy, {"radius": 7, "method1": cv2.INPAINT_TELEA, "method2": cv2.INPAINT_NS})
        
        # Multi-pass inpainting for large objects
        if strategy in ["extreme_large", "large_object"]:
            return self._multi_pass_inpainting(image, mask, params)
        else:
            # Standard dual-method approach
            result1 = cv2.inpaint(image, mask, params["radius"], params["method1"])
            result2 = cv2.inpaint(image, mask, params["radius"], params["method2"])
            
            # Combine results
            mask_float = mask.astype(np.float32) / 255.0
            mask_smooth = cv2.GaussianBlur(mask_float, (21, 21), 7)
            mask_smooth = np.expand_dims(mask_smooth, axis=2)
            
            combined = (result1.astype(np.float32) * (1 - mask_smooth) + 
                       result2.astype(np.float32) * mask_smooth)
            
            return np.clip(combined, 0, 255).astype(np.uint8)

    def _multi_pass_inpainting(self, image: np.ndarray, mask: np.ndarray, params: Dict) -> np.ndarray:
        """Multi-pass inpainting for very large objects"""
        result = image.copy()
        current_mask = mask.copy()
        
        # Multiple passes with increasing radius
        passes = [
            {"radius": 5, "method": cv2.INPAINT_TELEA},
            {"radius": params["radius"] // 2, "method": cv2.INPAINT_NS},
            {"radius": params["radius"], "method": cv2.INPAINT_NS},
        ]
        
        for i, pass_params in enumerate(passes):
            logger.info(f"Inpainting pass {i+1}/3 - radius: {pass_params['radius']}")
            
            # Erode mask for each pass to gradually fill from edges
            if i > 0:
                kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
                current_mask = cv2.erode(mask, kernel, iterations=i)
            
            if np.sum(current_mask > 0) > 0:
                result = cv2.inpaint(result, current_mask, pass_params["radius"], pass_params["method"])
        
        return result

    def _blend_with_original_large_object(self, original: np.ndarray, inpainted: np.ndarray, 
                                        mask: np.ndarray, strategy: str) -> np.ndarray:
        """Enhanced blending specifically for large objects with better removal"""
        
        # Strategy-specific blending parameters - more aggressive removal
        blend_params = {
            "extreme_large": {
                "blur_radius": 35, 
                "power": 0.3,  # Lower power = more aggressive replacement
                "erode_iter": 1,  # Less erosion to keep more of the mask
                "dilate_iter": 2,  # Add dilation to ensure full coverage
                "blend_strength": 0.95  # Higher strength = more inpainted content
            },
            "large_object": {
                "blur_radius": 25, 
                "power": 0.4, 
                "erode_iter": 1,
                "dilate_iter": 1,
                "blend_strength": 0.9
            }, 
            "complex_scene": {
                "blur_radius": 19, 
                "power": 0.5, 
                "erode_iter": 0,
                "dilate_iter": 1,
                "blend_strength": 0.85
            },
        }
        
        params = blend_params.get(strategy, {
            "blur_radius": 25, "power": 0.4, "erode_iter": 1, 
            "dilate_iter": 1, "blend_strength": 0.9
        })
        
        # Convert mask to float
        mask_float = mask.astype(np.float32) / 255.0
        
        # Create processing mask - start with dilation to ensure full coverage
        kernel_dilate = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
        mask_dilated = cv2.dilate(mask, kernel_dilate, iterations=params["dilate_iter"])
        
        # Then apply minimal erosion only if needed
        if params["erode_iter"] > 0:
            kernel_erode = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
            mask_processed = cv2.erode(mask_dilated, kernel_erode, iterations=params["erode_iter"])
        else:
            mask_processed = mask_dilated
        
        mask_processed_float = mask_processed.astype(np.float32) / 255.0
        
        # Create core mask (inner area that should be fully replaced)
        kernel_core = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        mask_core = cv2.erode(mask, kernel_core, iterations=3)
        mask_core_float = mask_core.astype(np.float32) / 255.0
        
        # Create edge mask for smooth blending
        mask_edge = mask_processed_float - mask_core_float
        mask_edge = np.clip(mask_edge, 0, 1)
        
        # Apply strong blur to edge mask only
        mask_edge_blurred = cv2.GaussianBlur(mask_edge, 
                                            (params["blur_radius"], params["blur_radius"]), 
                                            params["blur_radius"] // 3)
        
        # Combine core (full replacement) + blurred edge
        mask_final = mask_core_float + mask_edge_blurred * params["blend_strength"]
        mask_final = np.clip(mask_final, 0, 1)
        
        # Apply power function for smoother transition on edges only
        mask_edges_smooth = np.where(mask_core_float > 0.5, 1.0, 
                                    np.power(mask_final, params["power"]))
        
        # Expand dimensions for broadcasting
        mask_blend = np.expand_dims(mask_edges_smooth, axis=2)
        
        # Multi-stage blending for better results
        # Stage 1: Basic blend
        result_stage1 = (original.astype(np.float32) * (1 - mask_blend) + 
                        inpainted.astype(np.float32) * mask_blend)
        
        # Stage 2: Enhance inpainted regions with slight color correction
        inpainted_enhanced = self._enhance_inpainted_region(inpainted, original, mask_processed)
        
        # Final blend with enhanced inpainted content
        mask_final_blend = np.expand_dims(mask_processed_float, axis=2)
        result_final = (result_stage1 * (1 - mask_final_blend * 0.3) + 
                    inpainted_enhanced.astype(np.float32) * (mask_final_blend * 0.3))
        
        result = np.clip(result_final, 0, 255).astype(np.uint8)
        
        # Post-processing to remove any remaining artifacts
        result = self._post_process_large_object_removal(result, original, mask_processed)
        
        return result

    def _enhance_inpainted_region(self, inpainted: np.ndarray, original: np.ndarray, mask: np.ndarray) -> np.ndarray:
        """Enhance the inpainted region to better match surrounding colors"""
        
        # Get colors from the border region around the mask
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
        mask_dilated = cv2.dilate(mask, kernel, iterations=1)
        border_mask = mask_dilated - mask
        
        if np.sum(border_mask) > 0:
            # Calculate average color in border region
            border_pixels = original[border_mask > 0]
            if len(border_pixels) > 0:
                avg_color = np.mean(border_pixels, axis=0)
                
                # Slightly adjust inpainted region towards border colors
                mask_float = mask.astype(np.float32) / 255.0
                mask_3d = np.expand_dims(mask_float, axis=2)
                
                # Subtle color correction
                inpainted_adjusted = inpainted.astype(np.float32)
                color_correction = (avg_color - np.mean(inpainted[mask > 0], axis=0)) * 0.15
                
                inpainted_adjusted = inpainted_adjusted + (color_correction * mask_3d)
                return np.clip(inpainted_adjusted, 0, 255)
        
        return inpainted

    def _post_process_large_object_removal(self, result: np.ndarray, original: np.ndarray, mask: np.ndarray) -> np.ndarray:
        """Post-processing to clean up any remaining artifacts"""
        
        # Apply bilateral filter to smooth any harsh transitions
        result_smooth = cv2.bilateralFilter(result, 9, 80, 80)
        
        # Edge-preserving smoothing only in the removed region
        mask_float = mask.astype(np.float32) / 255.0
        mask_3d = np.expand_dims(mask_float, axis=2)
        
        # Selective smoothing - more aggressive in center, lighter on edges
        kernel_center = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        mask_center = cv2.erode(mask, kernel_center, iterations=2)
        mask_center_float = np.expand_dims(mask_center.astype(np.float32) / 255.0, axis=2)
        
        # Apply different levels of smoothing
        result_final = (result.astype(np.float32) * (1 - mask_center_float * 0.7) + 
                    result_smooth.astype(np.float32) * (mask_center_float * 0.7))
        
        # Final noise reduction
        result_final = cv2.medianBlur(result_final.astype(np.uint8), 3)
        
        return result_final

    def process(self, 
               input_image: np.ndarray, 
               coordinates: List[Dict[str, Union[int, float]]],
               config: Dict[str, Any] = None) -> np.ndarray:
        """Enhanced main processing function with large object handling"""
        if config is None:
            config = {}
            
        try:
            original_h, original_w = input_image.shape[:2]
            logger.info(f"Processing object removal: {original_w}x{original_h}")
            
            # Create initial mask
            mask = self._create_mask_from_coordinates(coordinates, original_w, original_h)
            
            if np.sum(mask > 0) == 0:
                logger.warning("Empty mask - returning original image")
                return input_image
            
            # Analyze mask complexity and determine strategy
            analysis = self._analyze_mask_complexity(mask, input_image.shape)
            strategy = analysis['strategy']
            
            logger.info(f"Mask analysis - Coverage: {analysis['coverage_ratio']:.2%}, "
                       f"Components: {analysis['num_components']}, Strategy: {strategy}")
            
            # Process mask according to strategy
            mask = self._process_mask_for_strategy(mask, strategy)
            
            # Choose appropriate inpainting method
            if self.use_lama and self.lama_model and config.get('use_lama', True):
                if strategy in ["large_object", "extreme_large", "complex_scene"]:
                    result = self._lama_inpainting_large_object(input_image, mask, strategy)
                    method_used = f"lama_{strategy}"
                else:
                    result = self.lama_model.inpaint(input_image, mask)
                    method_used = "lama"
            else:
                if strategy in ["large_object", "extreme_large", "complex_scene"]:
                    result = self._opencv_inpainting_large_object(input_image, mask, strategy)
                    method_used = f"opencv_{strategy}"
                else:
                    result = self._opencv_inpainting(input_image, mask)
                    method_used = "opencv"
            
            # Verify result quality
            result_mean = np.mean(result)
            if result_mean > 240 or result_mean < 15:  # Too bright or too dark
                logger.warning(f"Result quality issue (mean: {result_mean:.1f}), applying correction...")
                # Apply histogram matching to original image
                result = self._match_histogram(result, input_image, mask)
            
            # Enhanced blending for large objects
            if config.get('seamless_blend', True):
                if strategy in ["large_object", "extreme_large", "complex_scene"]:
                    result = self._blend_with_original_large_object(input_image, result, mask, strategy)
                else:
                    result = self._blend_with_original(input_image, result, mask)
            
            # Post-processing enhancement
            if config.get('enhance', True):
                result = self._enhance_result(result)
            
            logger.info(f"Object removal completed using {method_used} - Strategy: {strategy}")
            return result
            
        except Exception as e:
            logger.error(f"Object removal failed: {e}")
            # Enhanced emergency fallback
            try:
                mask = self._create_mask_from_coordinates(coordinates, input_image.shape[1], input_image.shape[0])
                # Much more conservative emergency processing
                kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
                mask = cv2.erode(mask, kernel, iterations=3)
                if np.sum(mask > 0) > 0:
                    return cv2.inpaint(input_image, mask, 3, cv2.INPAINT_TELEA)
                else:
                    return input_image
            except:
                return input_image

    def _match_histogram(self, source: np.ndarray, reference: np.ndarray, mask: np.ndarray) -> np.ndarray:
        """Match histogram of inpainted regions to reference image"""
        result = source.copy()
        
        # Only apply to inpainted regions
        mask_bool = mask > 127
        
        if not np.any(mask_bool):
            return result
        
        for channel in range(source.shape[2]):
            source_channel = source[:, :, channel]
            reference_channel = reference[:, :, channel]
            
            # Get histograms
            source_hist = cv2.calcHist([source_channel[mask_bool]], [0], None, [256], [0, 256])
            reference_hist = cv2.calcHist([reference_channel], [0], None, [256], [0, 256])
            
            # Calculate cumulative distributions
            source_cdf = np.cumsum(source_hist).astype(np.float64)
            reference_cdf = np.cumsum(reference_hist).astype(np.float64)
            
            # Normalize
            source_cdf /= source_cdf[-1]
            reference_cdf /= reference_cdf[-1]
            
            # Create lookup table
            lookup = np.zeros(256, dtype=np.uint8)
            for i in range(256):
                j = np.argmin(np.abs(reference_cdf - source_cdf[i]))
                lookup[i] = j
            
            # Apply only to masked regions
            result[mask_bool, channel] = lookup[source_channel[mask_bool]]
        
        return result

    def _opencv_inpainting(self, image: np.ndarray, mask: np.ndarray) -> np.ndarray:
        """Standard OpenCV inpainting for small/simple objects"""
        result_telea = cv2.inpaint(image, mask, 7, cv2.INPAINT_TELEA)
        result_ns = cv2.inpaint(image, mask, 7, cv2.INPAINT_NS)
        
        # Combine both methods
        mask_float = mask.astype(np.float32) / 255.0
        mask_smooth = cv2.GaussianBlur(mask_float, (21, 21), 7)
        mask_smooth = np.expand_dims(mask_smooth, axis=2)
        
        combined = (result_telea.astype(np.float32) * (1 - mask_smooth) + 
                   result_ns.astype(np.float32) * mask_smooth)
        
        result = np.clip(combined, 0, 255).astype(np.uint8)
        result = cv2.bilateralFilter(result, 9, 75, 75)
        
        return result

    def _blend_with_original(self, original: np.ndarray, inpainted: np.ndarray, 
                           mask: np.ndarray) -> np.ndarray:
        """Standard blending for small/simple objects"""
        mask_float = mask.astype(np.float32) / 255.0
        
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        mask_eroded = cv2.erode(mask, kernel, iterations=1)
        mask_eroded_float = mask_eroded.astype(np.float32) / 255.0
        
        mask_blurred = cv2.GaussianBlur(mask_eroded_float, (21, 21), 8)
        mask_blurred = np.expand_dims(mask_blurred, axis=2)
        
        mask_feathered = np.power(mask_blurred, 0.6)
        
        result = (original.astype(np.float32) * (1 - mask_feathered) + 
                 inpainted.astype(np.float32) * mask_feathered)
        
        return np.clip(result, 0, 255).astype(np.uint8)

    def _enhance_result(self, image: np.ndarray) -> np.ndarray:
        """Post-processing enhancement"""
        pil_image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
        
        pil_image = pil_image.filter(ImageFilter.MedianFilter(size=3))
        
        enhancer = ImageEnhance.Contrast(pil_image)
        pil_image = enhancer.enhance(1.02)
        
        enhancer = ImageEnhance.Sharpness(pil_image)
        pil_image = enhancer.enhance(1.01)
        
        enhanced = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
        return enhanced

    def cleanup(self):
        """Clean up resources"""
        if self.lama_model:
            self.lama_model.session = None
            self.lama_model = None
        gc.collect()
        logger.info("CPU processor cleanup completed")
        
    # Añadir al final de tu archivo processing.py

 # Add this function to the end of your processing.py file

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