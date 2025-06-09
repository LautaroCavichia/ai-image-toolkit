import logging
import os
import cv2
import numpy as np
from typing import Dict, Tuple, Any, Literal
from PIL import Image
import torch
from diffusers import StableDiffusionInpaintPipeline
import gc

from app.cloudinary_service import CloudinaryService
from app.config import MODELS_DIR

logger = logging.getLogger(__name__)

class ImageProcessingError(Exception):
    """Custom exception for image processing errors."""
    pass

AspectRatio = Literal["portrait", "landscape", "square"]

class MVPGenerativeFillProcessor:
    """MVP Ultra ligero - Solo Stable Diffusion con configuración mejorada para outpainting horizontal y vertical"""

    def __init__(self):
        self.pipeline = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.max_resolution = 640  # Resolución conservadora (ya es múltiplo de 8)
        self.model_loaded = False

        # PROMPTS MEJORADOS para agrandamiento en todas las direcciones
        self.base_prompts = {
    "landscape": (
        "natural outdoor environment, seamless landscape extension, organic terrain continuation, "
        "realistic ground textures, natural vegetation, appropriate sky conditions, "
        "environmental consistency, photorealistic details, natural lighting and shadows, "
        "harmonious color palette, depth and perspective, atmospheric effects, "
        "contextually appropriate elements, smooth transitions, high quality photography, "
        "professional composition, natural materials and surfaces, realistic proportions"
    ),
    
    "portrait": (
        "natural environmental backdrop, vertical scene extension, contextually appropriate surroundings, "
        "realistic background elements, natural lighting conditions, environmental depth, "
        "organic textures and materials, seamless vertical continuation, atmospheric perspective, "
        "appropriate scale and proportions, natural color harmony, professional photography quality, "
        "environmental storytelling, realistic surface details, natural ambient lighting, "
        "contextual consistency, smooth environmental transitions, high detail rendering"
    ),
    
    "square": (
        "balanced natural environment, seamless scene extension, contextually appropriate elements, "
        "realistic environmental details, natural lighting and atmosphere, organic textures, "
        "harmonious composition, environmental consistency, photorealistic quality, "
        "appropriate scale and depth, natural color relationships, professional photography, "
        "smooth transitions, realistic materials, environmental storytelling, "
        "natural ambient conditions, high quality details, contextual harmony"
    )
}

# NEGATIVE PROMPT mejorado y más específico para outpainting
        self.negative_prompt = (
    # Problemas de repetición y duplicación
    "duplicate objects, repeated elements, mirrored content, symmetrical repetition, "
    "visual echoes, cloned objects, copy-paste artifacts, pattern repetition, "
    "identical structures, replicated items, tiled appearance, obvious duplication, "
    
    # Problemas de orientación y perspectiva  
    "inverted elements, upside-down objects, incorrect orientation, flipped scenery, "
    "wrong perspective, distorted geometry, impossible angles, warped proportions, "
    "sky in ground, clouds below horizon, floating objects, gravity defying elements, "
    
    # Problemas de iluminación y sombras
    "inconsistent lighting, conflicting shadows, multiple light sources, wrong shadow direction, "
    "harsh lighting transitions, unnatural illumination, incorrect shadow casting, "
    "lighting inconsistencies, artificial lighting effects, dramatic lighting mismatches, "
    
    # Problemas de calidad y renderizado
    "low resolution, poor quality, blurry details, pixelated areas, compression artifacts, "
    "noise, grain, digital artifacts, rendering errors, poor textures, muddy colors, "
    "oversaturated colors, color banding, jpeg artifacts, low detail areas, "
    
    # Problemas de continuidad y transiciones
    "visible seams, hard edges, abrupt transitions, obvious boundaries, cut-off elements, "
    "discontinuous elements, jarring transitions, mismatched elements, broken continuity, "
    "unnatural joins, artificial boundaries, obvious editing marks, "
    
    # Elementos no deseados
    "text, watermarks, logos, signatures, overlays, UI elements, interface elements, "
    "frames, borders, captions, labels, artificial overlays, embedded text, "
    "copyright marks, social media elements, app interfaces, "
    
    # Problemas estéticos generales
    "ugly, deformed, malformed, distorted, unnatural appearance, artificial look, "
    "cartoon style, anime style, illustrated look, non-photorealistic, "
    "overstyled, overly processed, fake appearance, synthetic look"
)


        logger.info(f"Device: {self.device}")
        if torch.cuda.is_available():
            vram_gb = torch.cuda.get_device_properties(0).total_memory / (1024**3)
            logger.info(f"VRAM: {vram_gb:.1f} GB")

    def _clear_memory(self):
        """Limpieza agresiva de memoria CUDA"""
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            torch.cuda.synchronize()
        gc.collect()

    def _load_model(self) -> bool:
        """Cargar solo un modelo ultra liviano"""
        if self.model_loaded:
            return True

        try:
            logger.info("Loading ultra-light SD 1.5 inpainting model...")
            self._clear_memory()

            # Usar el modelo más liviano posible
            self.pipeline = StableDiffusionInpaintPipeline.from_pretrained(
                "runwayml/stable-diffusion-inpainting",
                torch_dtype=torch.float16,  # Half precision para ahorrar VRAM
                safety_checker=None,
                requires_safety_checker=False,
                cache_dir=MODELS_DIR,
                low_cpu_mem_usage=True,
                variant="fp16"
            ).to(self.device)

            # Optimizaciones extremas para RTX 2050
            self.pipeline.enable_attention_slicing("max")
            self.pipeline.enable_sequential_cpu_offload()
            self.pipeline.enable_model_cpu_offload()
            self.pipeline.enable_vae_slicing()

            # Intentar usar xformers si está disponible
            try:
                self.pipeline.enable_xformers_memory_efficient_attention()
                logger.info("XFormers enabled for memory efficiency")
            except Exception:
                logger.info("XFormers not available, using default attention")

            self.model_loaded = True
            logger.info("Model loaded successfully!")
            return True

        except Exception as e:
            logger.error(f"Model loading failed: {e}")
            self._clear_memory()
            return False

    def _round_to_multiple_of_8(self, value: int) -> int:
        """Redondear a múltiplo de 8 (requerido por Stable Diffusion)"""
        return ((value + 7) // 8) * 8

    def _calculate_target_dimensions(self, width: int, height: int, aspect: AspectRatio) -> Tuple[int, int]:
        """Calcular dimensiones objetivo para agrandar la imagen según el aspect ratio deseado"""
        max_size = self.max_resolution
        
        # Factor de agrandamiento - siempre expandir al menos un 30-50%
        expansion_factor = 1.4  # Agranda la imagen un 40%
        
        if aspect == "square":
            # Para square, crear un cuadrado más grande que la imagen original
            base_size = max(width, height) * expansion_factor
            target_w = target_h = int(base_size)
            
            # Si excede el límite, escalar manteniendo proporción cuadrada
            if target_w > max_size:
                target_w = target_h = max_size
                
        elif aspect == "portrait":
            # Portrait (3:4 ratio) - crear imagen más grande en formato portrait
            desired_ratio = 3/4  # width/height
            
            # Expandir basándose en la dimensión mayor actual
            base_dimension = max(width, height) * expansion_factor
            
            # Calcular dimensiones para portrait manteniendo el ratio
            target_h = int(base_dimension)
            target_w = int(target_h * desired_ratio)
            
            # Asegurar que sea más grande que la imagen original
            if target_w < width * 1.2:
                target_w = int(width * 1.3)
                target_h = int(target_w / desired_ratio)
            if target_h < height * 1.2:
                target_h = int(height * 1.3)
                target_w = int(target_h * desired_ratio)
            
            # Aplicar límite de resolución
            if target_h > max_size:
                scale = max_size / target_h
                target_w = int(target_w * scale)
                target_h = int(target_h * scale)
                
        elif aspect == "landscape":
            # Landscape (4:3 ratio) - crear imagen más grande en formato landscape
            desired_ratio = 4/3  # width/height
            
            # Expandir basándose en la dimensión mayor actual
            base_dimension = max(width, height) * expansion_factor
            
            # Calcular dimensiones para landscape manteniendo el ratio
            target_w = int(base_dimension)
            target_h = int(target_w / desired_ratio)
            
            # Asegurar que sea más grande que la imagen original
            if target_w < width * 1.2:
                target_w = int(width * 1.3)
                target_h = int(target_w / desired_ratio)
            if target_h < height * 1.2:
                target_h = int(height * 1.3)
                target_w = int(target_h * desired_ratio)
            
            # Aplicar límite de resolución
            if target_w > max_size:
                scale = max_size / target_w
                target_w = int(target_w * scale)
                target_h = int(target_h * scale)
        else:
            # Fallback: simplemente agranda manteniendo proporción original
            scale_factor = expansion_factor
            target_w = int(width * scale_factor)
            target_h = int(height * scale_factor)
            
            if target_w > max_size or target_h > max_size:
                scale = min(max_size / target_w, max_size / target_h)
                target_w = int(target_w * scale)
                target_h = int(target_h * scale)
            
        # CRÍTICO: Asegurar que sean múltiplos de 8
        target_w = self._round_to_multiple_of_8(target_w)
        target_h = self._round_to_multiple_of_8(target_h)
        
        return target_w, target_h

    def _create_canvas_and_mask(self, image: np.ndarray, target_w: int, target_h: int) -> Tuple[Image.Image, Image.Image]:
        """Crear canvas y máscara optimizada para expansión horizontal y vertical"""
        original_h, original_w = image.shape[:2]
        
        # VERIFICAR que las dimensiones objetivo sean múltiplos de 8
        assert target_w % 8 == 0 and target_h % 8 == 0, f"Target dimensions must be divisible by 8, got {target_w}x{target_h}"
        
        # Convertir imagen original a PIL RGB
        if len(image.shape) == 3:
            original_pil = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
        else:
            original_pil = Image.fromarray(image)

        # Si la imagen original es más grande que el target, escalamos
        if original_w > target_w or original_h > target_h:
            scale = min(target_w / original_w, target_h / original_h)
            new_w = int(original_w * scale)
            new_h = int(original_h * scale)
            original_pil = original_pil.resize((new_w, new_h), Image.Resampling.LANCZOS)
        else:
            new_w, new_h = original_w, original_h

        # CLAVE: Crear canvas con gradiente inteligente
        canvas = Image.new('RGB', (target_w, target_h))
        canvas_array = np.array(canvas)
        
        # Crear gradiente base vertical: cielo arriba, suelo abajo
        for y in range(target_h):
            ratio = y / target_h
            
            if ratio < 0.4:  # Parte superior = cielo
                blue_intensity = int(235 - (ratio * 100))
                base_color = (135, 206, max(180, blue_intensity))
            else:  # Parte inferior = suelo
                green_component = int(150 - ((ratio - 0.4) * 80))
                brown_component = int(100 + ((ratio - 0.4) * 50))
                base_color = (brown_component, max(80, green_component), 70)
            
            # Añadir variación horizontal sutil para evitar uniformidad
            for x in range(target_w):
                x_ratio = x / target_w
                # Variación muy sutil en el color base
                color_variation = int(10 * np.sin(x_ratio * np.pi * 2))
                varied_color = (
                    max(0, min(255, base_color[0] + color_variation)),
                    max(0, min(255, base_color[1] + color_variation)),
                    max(0, min(255, base_color[2] + color_variation))
                )
                canvas_array[y, x] = varied_color
        
        canvas = Image.fromarray(canvas_array)

        # Centrar la imagen original
        x_offset = (target_w - new_w) // 2
        y_offset = (target_h - new_h) // 2

        # Pegar la imagen original
        canvas.paste(original_pil, (x_offset, y_offset))

        # MÁSCARA MEJORADA para expansión en todas las direcciones
        mask_array = np.zeros((target_h, target_w), dtype=np.uint8)

        # Marcar áreas de generación (fuera de la imagen original)
        # Expansión vertical (arriba y abajo)
        if y_offset > 0:
            mask_array[0:y_offset, :] = 255  # Área superior
        
        if y_offset + new_h < target_h:
            mask_array[y_offset + new_h:target_h, :] = 255  # Área inferior
        
        # Expansión horizontal (izquierda y derecha)
        if x_offset > 0:
            mask_array[:, 0:x_offset] = 255  # Área izquierda
        
        if x_offset + new_w < target_w:
            mask_array[:, x_offset + new_w:target_w] = 255  # Área derecha

        # CLAVE: Zona de transición más amplia para mejor blending en todas las direcciones
        transition_size = min(20, min(new_w, new_h) // 8)  # Transición más amplia
        
        if transition_size > 2:
            # Crear gradiente de transición más suave
            for i in range(transition_size):
                progress = (i + 1) / transition_size
                alpha = int(255 * (progress ** 0.5))  # Gradiente más suave
                
                border_idx = transition_size - 1 - i
                
                # Transición superior
                if y_offset > 0 and (y_offset + new_h - 1 - border_idx) >= y_offset:
                    row = y_offset + new_h - 1 - border_idx
                    mask_array[row, x_offset:x_offset + new_w] = np.maximum(mask_array[row, x_offset:x_offset + new_w], alpha)
                
                # Transición inferior  
                if y_offset + new_h < target_h and (y_offset + border_idx) < (y_offset + new_h):
                    row = y_offset + border_idx
                    mask_array[row, x_offset:x_offset + new_w] = np.maximum(mask_array[row, x_offset:x_offset + new_w], alpha)
                
                # Transición izquierda
                if x_offset > 0 and (x_offset + new_w - 1 - border_idx) >= x_offset:
                    col = x_offset + new_w - 1 - border_idx
                    mask_array[y_offset:y_offset + new_h, col] = np.maximum(mask_array[y_offset:y_offset + new_h, col], alpha)
                
                # Transición derecha
                if x_offset + new_w < target_w and (x_offset + border_idx) < (x_offset + new_w):
                    col = x_offset + border_idx
                    mask_array[y_offset:y_offset + new_h, col] = np.maximum(mask_array[y_offset:y_offset + new_h, col], alpha)

        mask = Image.fromarray(mask_array)

        logger.info(f"Canvas created: {canvas.width}x{canvas.height}")
        logger.info(f"Original placed at ({x_offset},{y_offset}) with size {new_w}x{new_h}")
        
        # Análisis de la máscara
        mask_array_check = np.array(mask)
        white_pixels = np.sum(mask_array_check == 255)
        black_pixels = np.sum(mask_array_check == 0)
        gray_pixels = np.sum((mask_array_check > 0) & (mask_array_check < 255))
        
        # Análisis de expansión
        expand_top = y_offset > 0
        expand_bottom = y_offset + new_h < target_h
        expand_left = x_offset > 0  
        expand_right = x_offset + new_w < target_w
        
        expansion_info = []
        if expand_top: expansion_info.append("top")
        if expand_bottom: expansion_info.append("bottom") 
        if expand_left: expansion_info.append("left")
        if expand_right: expansion_info.append("right")
        
        logger.info(f"Expansion directions: {', '.join(expansion_info) if expansion_info else 'none'}")
        logger.info(f"Mask - Generate: {white_pixels}, Keep: {black_pixels}, Transition: {gray_pixels}")
        
        return canvas, mask

    def _generate_fill(self, canvas: Image.Image, mask: Image.Image, aspect: AspectRatio) -> Image.Image:
        """Generar el fill usando prompt específico para el aspecto"""
        try:
            self._clear_memory()

            canvas_w, canvas_h = canvas.width, canvas.height
            
            # Seleccionar prompt según el aspecto ratio
            prompt = self.base_prompts.get(aspect, self.base_prompts["square"])
            
            logger.info(f"Generating with aspect-specific prompt for {aspect}")
            logger.info(f"Canvas dimensions: {canvas_w}x{canvas_h}")

            # CONFIGURACIÓN OPTIMIZADA para outpainting natural en todas las direcciones
            result = self.pipeline(
                prompt=prompt,
                negative_prompt=self.negative_prompt,
                image=canvas,
                mask_image=mask,
                num_inference_steps=50,      # Más pasos para mejor calidad con expansión horizontal
                guidance_scale=8.0,         # Ajustado para expansión multidireccional
                strength=0.99,
                eta = 0.0,# Ligeramente reducido para mejor blending
                height=canvas_h,
                width=canvas_w,
                # CLAVE: Usar diferentes seeds para evitar patrones repetitivos
                generator=torch.Generator(device=self.device).manual_seed(
                    hash(f"{prompt}_{aspect}_{canvas_w}x{canvas_h}") % 2147483647
                )
            ).images[0]

            logger.info("Fill generation completed")
            return result

        except Exception as e:
            logger.error(f"Fill generation failed: {e}")
            raise
        finally:
            self._clear_memory()

    def process(self, input_image: np.ndarray, target_aspect: AspectRatio) -> np.ndarray:
        """Función principal de procesamiento - siempre agranda la imagen"""
        try:
            # Cargar modelo
            if not self._load_model():
                raise RuntimeError("Failed to load the inpainting model")

            h, w = input_image.shape[:2]
            logger.info(f"Processing image: {w}x{h} -> {target_aspect} (enlarging)")

            # Calcular dimensiones objetivo (siempre más grandes)
            target_w, target_h = self._calculate_target_dimensions(w, h, target_aspect)
            logger.info(f"Target dimensions: {target_w}x{target_h} (expansion factor: {target_w/w:.1f}x{target_h/h:.1f})")

            # Verificar que efectivamente sea un agrandamiento
            if target_w <= w and target_h <= h:
                # Si por alguna razón no se agrandó, forzar agrandamiento mínimo
                logger.warning("Target dimensions not larger than original, forcing enlargement")
                scale_factor = 1.3
                target_w = self._round_to_multiple_of_8(int(w * scale_factor))
                target_h = self._round_to_multiple_of_8(int(h * scale_factor))
                logger.info(f"Forced target dimensions: {target_w}x{target_h}")

            # Crear canvas y máscara para agrandamiento
            canvas, mask = self._create_canvas_and_mask(input_image, target_w, target_h)

            # Generar el fill con prompt específico
            result_pil = self._generate_fill(canvas, mask, target_aspect)

            # Convertir de vuelta a numpy array (BGR para OpenCV)
            result_array = np.array(result_pil)
            result_bgr = cv2.cvtColor(result_array, cv2.COLOR_RGB2BGR)

            logger.info(f"Processing completed successfully - enlarged from {w}x{h} to {target_w}x{target_h}")
            return result_bgr

        except Exception as e:
            logger.error(f"Processing failed: {e}")
            raise
        finally:
            self._clear_memory()


# Función principal mejorada
async def perform_image_enlargement(
    job_id: str,
    image_url: str,
    config: Dict[str, Any]
) -> Tuple[str, Dict[str, Any]]:
    """Función principal del MVP con mejoras de expansión horizontal y vertical"""

    processor = None
    try:
        # Crear directorio de modelos
        os.makedirs(MODELS_DIR, exist_ok=True)

        # Descargar imagen
        logger.info(f"Downloading image for job {job_id}")
        image_bytes = CloudinaryService.download_image_from_url(image_url)

        # Decodificar imagen
        nparr = np.frombuffer(image_bytes, np.uint8)
        input_image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if input_image is None:
            raise ValueError("Failed to decode image")

        # Configuración
        aspect_ratio = config.get('aspectRatio', 'square')
        if aspect_ratio not in ("portrait", "landscape", "square"):
            logger.warning(f"Invalid aspectRatio '{aspect_ratio}' received; defaulting to 'square'")
            aspect_ratio = "square"

        # Crear procesador mejorado
        logger.info("Initializing enhanced MVP Generative Fill processor with horizontal expansion")
        processor = MVPGenerativeFillProcessor()

        # Procesar imagen
        output_image = processor.process(input_image, aspect_ratio)

        # Codificar resultado
        encode_params = [cv2.IMWRITE_PNG_COMPRESSION, 6]
        is_success, buffer = cv2.imencode('.png', output_image, encode_params)

        if not is_success:
            raise RuntimeError("Failed to encode output image")

        output_bytes = buffer.tobytes()

        # Crear thumbnail
        h, w = output_image.shape[:2]
        thumb_scale = min(300 / w, 300 / h, 1.0)

        if thumb_scale < 1.0:
            new_w = int(w * thumb_scale)
            new_h = int(h * thumb_scale)
            thumbnail = cv2.resize(output_image, (new_w, new_h), interpolation=cv2.INTER_AREA)
        else:
            thumbnail = output_image.copy()

        is_success, thumb_buffer = cv2.imencode('.png', thumbnail)
        if not is_success:
            raise RuntimeError("Failed to encode thumbnail")

        thumbnail_bytes = thumb_buffer.tobytes()

        # Subir a Cloudinary
        processed_url, processed_public_id = CloudinaryService.upload_processed_image(
            output_bytes, job_id, "generative_fill"
        )

        thumbnail_url, thumbnail_public_id = CloudinaryService.upload_thumbnail(
            thumbnail_bytes, job_id
        )

        # Información del procesamiento
        original_h, original_w = input_image.shape[:2]
        output_h, output_w = output_image.shape[:2]

        processing_info = {
            "processing_type": "image_enlargement_with_aspect_change",
            "model": "stable-diffusion-inpainting",
            "prompt_used": processor.base_prompts.get(aspect_ratio, "natural landscape"),
            "aspect_ratio": aspect_ratio,
            "original_size": f"{original_w}x{original_h}",
            "output_size": f"{output_w}x{output_h}",
            "expansion_factor": f"{output_w/original_w:.1f}x{output_h/original_h:.1f}",
            "full_quality_public_id": processed_public_id,
            "thumbnail_public_id": thumbnail_public_id,
            "thumbnail_url": thumbnail_url,
            "device_used": processor.device,
            "improvements": "always_enlarges_with_aspect_ratio_transformation"
        }

        logger.info(f"Job {job_id} completed successfully with enhanced multidirectional outpainting")
        return processed_url, processing_info

    except Exception as e:
        logger.error(f"Job {job_id} failed: {e}")
        raise ImageProcessingError(f"Enhanced generative fill processing failed: {e}")

    finally:
        # Limpieza global
        if processor is not None:
            processor._clear_memory()