import logging
import os
import cv2
import numpy as np
import asyncio
from typing import Dict, Tuple, Any, Optional
from PIL import Image, ImageEnhance, ImageFilter
import torch
from diffusers import (
    StableDiffusionPipeline, 
    EulerAncestralDiscreteScheduler,
    DPMSolverMultistepScheduler,
)
import gc
import hashlib

from app.cloudinary_service import CloudinaryService
from app.config import MODELS_DIR
from app.local_image_processing import LocalImageProcessor
from app.dto import ImageGenerationConfigDTO

logger = logging.getLogger(__name__)

class ImageProcessingError(Exception):
    """Custom exception for image processing errors."""
    pass

class TextToImageProcessor:
    """Optimized text-to-image generation processor."""
    
    _instance = None
    _lock = asyncio.Lock()

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if hasattr(self, '_initialized'):
            return
            
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model_loaded = False
        self.pipeline = None
        self._current_jobs = set()  # Track active jobs to prevent duplicates
        
        # Optimized resolutions (menores para mejor velocidad)
        self.resolutions = {
        "square": (512, 512),      # Resolución estándar
        "portrait": (512, 768),    # Mejor para retratos
        "landscape": (768, 512),   # Mejor para paisajes
}
        
        # Balanced quality settings (mejor balance velocidad/calidad)
        self.quality_settings = {
            "FREE": {
                "steps": 20,            # Reduced from 10
                "guidance_scale": 7.5, # Reduced from 7.5
                
            },
            "PREMIUM": {
                "steps": 30,           # Reduced from 35
                "guidance_scale": 7.5, # Reduced from 8.5
                # Removed upscaling
            }
        }
        
        # Cache for processed prompts to avoid duplicates
        self._prompt_cache = {}
        self._cache_size_limit = 100
        
        self._initialized = True
        logger.info(f"Optimized processor initialized on device: {self.device}")

    def _generate_job_hash(self, prompt: str, config: Dict) -> str:
        """Generate unique hash for job to prevent duplicates."""
        job_data = f"{prompt}_{config.get('aspectRatio', 'square')}_{config.get('quality', 'FREE')}"
        return hashlib.md5(job_data.encode()).hexdigest()

    def _clear_memory(self):
        """Optimized memory clearing."""
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        gc.collect()

    def _load_model(self) -> bool:
        """Load optimized Stable Diffusion model."""
        if self.model_loaded:
            return True

        try:
            logger.info("Loading optimized Stable Diffusion model...")
            self._clear_memory()

            # Single, reliable model choice
            model_id = "stabilityai/stable-diffusion-2-base"
  # Most stable and fast
            
            dtype = torch.float16 if self.device == "cuda" else torch.float32
            
            # Optimized loading parameters
            self.pipeline = StableDiffusionPipeline.from_pretrained(
                model_id,
                torch_dtype=dtype,
                safety_checker=None,
                requires_safety_checker=False,
                cache_dir=MODELS_DIR,
                low_cpu_mem_usage=True,
                use_safetensors=True
            )
            
            self.pipeline = self.pipeline.to(self.device)
            
            # Minimal optimizations for speed
            if self.device == "cuda":
                try:
                    # Only essential optimizations
                    self.pipeline.enable_memory_efficient_attention()
                except:
                    pass
                
                # CPU offload only for very low VRAM
                try:
                    if torch.cuda.get_device_properties(0).total_memory < 6 * 1024**3:
                        self.pipeline.enable_model_cpu_offload()
                except:
                    pass

            # Fast scheduler
            self.pipeline.scheduler = EulerAncestralDiscreteScheduler.from_config(
                self.pipeline.scheduler.config
            )

            self.model_loaded = True
            logger.info("Optimized model loaded successfully!")
            return True

        except Exception as e:
            logger.error(f"Model loading failed: {e}")
            self._clear_memory()
            return False

    def _enhance_prompt(self, prompt: str, quality: str = "FREE") -> str:
        """Enhanced prompt with better framing."""
        base_prompt = prompt.strip()
        
        # Agregar términos de encuadre y composición
        framing_terms = [
            "full view",
            "complete subject", 
            "well framed",
            "centered composition",
            "wide shot"
        ]
        
        if quality == "PREMIUM":
            enhancers = [
                "high quality", "detailed", "8k", "professional photography",
                "full view", "complete subject", "well composed", "centered"
            ]
        else:
            enhancers = [
                "high quality", "full view", "complete subject", 
                "well framed", "centered"
            ]
        
        return f"{base_prompt}, {', '.join(enhancers)}"

    def _get_negative_prompt(self, custom_negative: str = None) -> str:
        """Enhanced negative prompt to avoid cropping."""
        base_negative = [
            "low quality", "blurry", "bad anatomy", "deformed", 
            "watermark", "text", "signature",
            
            "cropped", "cut off", "partial view", "cropped out",
            "incomplete", "cut", "truncated", "border crop"
        ]
        
        negative_prompt = ", ".join(base_negative)
        
        if custom_negative:
            negative_prompt = f"{custom_negative}, {negative_prompt}"
            
        return negative_prompt


    async def generate_image(
        self, 
        job_id: str,
        prompt: str, 
        aspect_ratio: str = "square",
        negative_prompt: str = None,
        steps: int = None,
        guidance_scale: float = None,
        quality: str = "FREE"
    ) -> np.ndarray:
        """
        Generate optimized image from text prompt.
        """
        # Check for duplicate jobs
        job_hash = self._generate_job_hash(prompt, {
            'aspectRatio': aspect_ratio,
            'quality': quality
        })
        
        if job_hash in self._current_jobs:
            logger.warning(f"Duplicate job detected for {job_id}, skipping...")
            raise ImageProcessingError("Duplicate job detected")
        
        self._current_jobs.add(job_hash)
        
        try:
            # Load model if not already loaded
            if not self._load_model():
                raise RuntimeError("Failed to load the text-to-image model")

            # Get quality settings
            quality_config = self.quality_settings[quality]
            
            if steps is None:
                steps = quality_config["steps"]
            if guidance_scale is None:
                guidance_scale = quality_config["guidance_scale"]

            # Get resolution
            width, height = self.resolutions.get(aspect_ratio, self.resolutions["square"])

            # Enhance prompt (simplified)
            enhanced_prompt = self._enhance_prompt(prompt, quality)
            full_negative_prompt = self._get_negative_prompt(negative_prompt)
            
            logger.info(f"Generating image for {job_id}: {width}x{height}, steps={steps}")

            # Fixed seed for consistency (optional)
            generator = torch.Generator(device=self.device).manual_seed(42)
            
            # Generate image with optimized settings
            with torch.inference_mode():
                result = self.pipeline(
                    prompt=enhanced_prompt,
                    negative_prompt=full_negative_prompt,
                    num_inference_steps=steps,
                    guidance_scale=guidance_scale,
                    width=width,
                    height=height,
                    generator=generator,
                    num_images_per_prompt=1,
                    output_type="pil"
                ).images[0]

            # Minimal post-processing
           

            # Convert to BGR
            result_array = np.array(result)
            result_bgr = cv2.cvtColor(result_array, cv2.COLOR_RGB2BGR)

            logger.info(f"Image generation completed for {job_id}")
            return result_bgr

        except Exception as e:
            logger.error(f"Image generation failed for {job_id}: {e}")
            raise
        finally:
            # Remove from active jobs
            self._current_jobs.discard(job_hash)
            self._clear_memory()

# Global processor instance
_processor_instance = None

async def get_processor():
    """Get singleton processor instance."""
    global _processor_instance
    async with TextToImageProcessor._lock:
        if _processor_instance is None:
            _processor_instance = TextToImageProcessor()
        return _processor_instance

async def perform_image_generation(
    job_id: str,
    config: Dict[str, Any]
) -> Tuple[str, Dict[str, Any]]:
    """
    Optimized main function for text-to-image generation.
    """
    # CPU optimization
      # Fixed thread count
    
    try:
        os.makedirs(MODELS_DIR, exist_ok=True)

        # Parse configuration
        generation_config = ImageGenerationConfigDTO(**config)

        if not generation_config.validate_prompt():
            raise ValueError("Invalid prompt")

        logger.info(f"Starting optimized generation for job {job_id}")

        # Get processor instance
        processor = await get_processor()

        # Generate image
        output_image = await processor.generate_image(
            job_id=job_id,
            prompt=generation_config.prompt,
            aspect_ratio=generation_config.aspectRatio.value,
            negative_prompt=generation_config.negativePrompt,
            steps=generation_config.steps,
            guidance_scale=generation_config.guidanceScale,
            quality=generation_config.quality.value
        )

        # Optimized encoding
        encode_params = [cv2.IMWRITE_PNG_COMPRESSION, 6]  # Balanced compression
        is_success, buffer = cv2.imencode('.png', output_image, encode_params)

        if not is_success:
            raise RuntimeError("Failed to encode output image")

        output_bytes = buffer.tobytes()

        # Generate thumbnail
        logger.info(f"Generating thumbnail for {job_id}")
        thumbnail_bytes = LocalImageProcessor.create_thumbnail(output_bytes)
        
        # Upload to Cloudinary
        logger.info(f"Uploading to Cloudinary for {job_id}")
        processed_url, processed_public_id = CloudinaryService.upload_processed_image(
            output_bytes, job_id, "pixel_perfect"
        )
        
        thumbnail_url, thumbnail_public_id = CloudinaryService.upload_thumbnail(
            thumbnail_bytes, job_id
        )

        # Processing info
        output_h, output_w = output_image.shape[:2]
        
        processing_info = {
            "processing_type": "text_to_image_generation_optimized",
            "model": "stable-diffusion-v1-5-optimized",
            "prompt": generation_config.prompt,
            "aspect_ratio": generation_config.aspectRatio.value,
            "output_size": f"{output_w}x{output_h}",
            "steps": processor.quality_settings[generation_config.quality.value]["steps"],
            "guidance_scale": processor.quality_settings[generation_config.quality.value]["guidance_scale"],
            "quality": generation_config.quality.value,
            "full_quality_public_id": processed_public_id,
            "thumbnail_public_id": thumbnail_public_id,
            "thumbnail_url": thumbnail_url,
            "device_used": processor.device,
            "optimizations_applied": ["reduced_steps", "fixed_resolution", "singleton_model", "duplicate_prevention"]
        }

        logger.info(f"Job {job_id} completed successfully")
        return processed_url, processing_info

    except Exception as e:
        logger.error(f"Job {job_id} failed: {e}")
        raise ImageProcessingError(f"Image generation failed: {e}")

    finally:
          if processor is not None:
            processor._clear_memory()
       