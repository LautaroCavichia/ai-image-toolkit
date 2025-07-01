import logging
import os
import cv2
import numpy as np

from typing import Dict, Tuple, Any
from PIL import Image
import torch
from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler
import gc

from app.cloudinary_service import CloudinaryService
from app.config import MODELS_DIR
from app.local_image_processing import LocalImageProcessor
from app.dto import ImageGenerationConfigDTO

logger = logging.getLogger(__name__)

class ImageProcessingError(Exception):
    """Custom exception for image processing errors."""
    pass

class TextToImageProcessor:
    """Text-to-image generation processor using Stable Diffusion."""

    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model_loaded = False
        self.pipeline = None
        
        # Resolution configurations based on aspect ratio
        self.resolutions = {
            "square": (512, 512),
            "portrait": (512, 768),  # 2:3 ratio
            "landscape": (768, 512)  # 3:2 ratio
        }
        
        logger.info(f"Device: {self.device}")
        if torch.cuda.is_available():
            vram_gb = torch.cuda.get_device_properties(0).total_memory / (1024**3)
            logger.info(f"VRAM: {vram_gb:.1f} GB")

    def _clear_memory(self):
        """Clear GPU memory."""
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            torch.cuda.synchronize()
        gc.collect()

    def _load_model(self) -> bool:
        """Load Stable Diffusion model."""
        if self.model_loaded:
            return True

        try:
            logger.info("Loading Stable Diffusion model...")
            self._clear_memory()

            # Load Stable Diffusion pipeline
            self.pipeline = StableDiffusionPipeline.from_pretrained(
                "runwayml/stable-diffusion-v1-5",
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                safety_checker=None,
                requires_safety_checker=False,
                cache_dir=MODELS_DIR,
                low_cpu_mem_usage=True
            ).to(self.device)

            # Optimize for memory efficiency
            if self.device == "cuda":
                self.pipeline.enable_attention_slicing("max")
                self.pipeline.enable_model_cpu_offload()
                self.pipeline.enable_vae_slicing()

                # Try to use xformers if available
                try:
                    self.pipeline.enable_xformers_memory_efficient_attention()
                    logger.info("XFormers enabled for memory efficiency")
                except Exception:
                    logger.info("XFormers not available, using default attention")

            # Set scheduler
            self.pipeline.scheduler = DPMSolverMultistepScheduler.from_config(
                self.pipeline.scheduler.config
            )

            self.model_loaded = True
            logger.info("Model loaded successfully!")
            return True

        except Exception as e:
            logger.error(f"Model loading failed: {e}")
            self._clear_memory()
            return False

    def generate_image(
        self, 
        prompt: str, 
        aspect_ratio: str = "square",
        negative_prompt: str = None,
        steps: int = 20,
        guidance_scale: float = 7.5,
        quality: str = "FREE"
    ) -> np.ndarray:
        """
        Generate image from text prompt.
        
        Args:
            prompt: Text description for image generation
            aspect_ratio: Target aspect ratio (square, portrait, landscape)
            negative_prompt: Things to avoid in the image
            steps: Number of inference steps
            guidance_scale: Guidance scale for generation
            quality: Quality level (FREE or PREMIUM)
        
        Returns:
            Generated image as numpy array (BGR format)
        """
        try:
            # Load model if not already loaded
            if not self._load_model():
                raise RuntimeError("Failed to load the text-to-image model")

            # Get resolution for aspect ratio
            width, height = self.resolutions.get(aspect_ratio, self.resolutions["square"])
            
            # Adjust parameters based on quality
            if quality == "PREMIUM":
                steps = max(steps, 30)  # At least 30 steps for premium
                guidance_scale = max(guidance_scale, 8.0)  # Higher guidance for premium
            
            logger.info(f"Generating image: {width}x{height}, steps={steps}, guidance={guidance_scale}")
            logger.info(f"Prompt: {prompt}")
            if negative_prompt:
                logger.info(f"Negative prompt: {negative_prompt}")

            # Generate image
            with torch.autocast(self.device):
                result = self.pipeline(
                    prompt=prompt,
                    negative_prompt=negative_prompt,
                    num_inference_steps=steps,
                    guidance_scale=guidance_scale,
                    width=width,
                    height=height,
                    generator=torch.Generator(device=self.device).manual_seed(42)  # For reproducible results
                ).images[0]

            # Convert PIL to numpy array (BGR for OpenCV)
            result_array = np.array(result)
            result_bgr = cv2.cvtColor(result_array, cv2.COLOR_RGB2BGR)

            logger.info(f"Image generation completed successfully: {width}x{height}")
            return result_bgr

        except Exception as e:
            logger.error(f"Image generation failed: {e}")
            raise
        finally:
            self._clear_memory()

async def perform_image_generation(
    job_id: str,
    config: Dict[str, Any]
) -> Tuple[str, Dict[str, Any]]:
    """
    Main function for text-to-image generation.
    
    Args:
        job_id: Unique job identifier
        config: Generation configuration
    
    Returns:
        Tuple of (processed_image_url, processing_params)
    """
    processor = None
    try:
        # Create models directory
        os.makedirs(MODELS_DIR, exist_ok=True)

        # Parse configuration
        try:
            generation_config = ImageGenerationConfigDTO(**config)
        except Exception as e:
            raise ValueError(f"Invalid configuration: {e}")

        # Validate prompt
        if not generation_config.validate_prompt():
            raise ValueError("Prompt is required and must be at least 3 characters long")

        logger.info(f"Starting image generation for job {job_id}")
        logger.info(f"Prompt: {generation_config.prompt}")
        logger.info(f"Aspect ratio: {generation_config.aspectRatio}")
        logger.info(f"Quality: {generation_config.quality}")

        # Create processor
        processor = TextToImageProcessor()

        # Generate image
        output_image = processor.generate_image(
            prompt=generation_config.prompt,
            aspect_ratio=generation_config.aspectRatio.value,
            negative_prompt=generation_config.negativePrompt,
            steps=generation_config.steps,
            guidance_scale=generation_config.guidanceScale,
            quality=generation_config.quality.value
        )

        # Encode result
        encode_params = [cv2.IMWRITE_PNG_COMPRESSION, 6]
        is_success, buffer = cv2.imencode('.png', output_image, encode_params)

        if not is_success:
            raise RuntimeError("Failed to encode output image")

        output_bytes = buffer.tobytes()

        # Generate thumbnail locally for better quality control
        logger.info(f"🖼️ Generating thumbnail locally for {job_id}")
        thumbnail_bytes = LocalImageProcessor.create_thumbnail(output_bytes)
        
        # Optimize premium image
        optimized_premium_bytes = LocalImageProcessor.optimize_premium_image(output_bytes)
        
        # Upload to Cloudinary
        logger.info(f"☁️ Uploading premium optimized image to Cloudinary for {job_id}")
        processed_url, processed_public_id = CloudinaryService.upload_processed_image(
            optimized_premium_bytes, job_id, "text_to_image"
        )
        
        logger.info(f"☁️ Uploading thumbnail to Cloudinary for {job_id}")
        thumbnail_url, thumbnail_public_id = CloudinaryService.upload_thumbnail(
            thumbnail_bytes, job_id
        )

        # Prepare processing information
        output_h, output_w = output_image.shape[:2]
        
        processing_info = {
            "processing_type": "text_to_image_generation",
            "model": "stable-diffusion-v1-5",
            "prompt": generation_config.prompt,
            "negative_prompt": generation_config.negativePrompt,
            "aspect_ratio": generation_config.aspectRatio.value,
            "output_size": f"{output_w}x{output_h}",
            "steps": generation_config.steps,
            "guidance_scale": generation_config.guidanceScale,
            "quality": generation_config.quality.value,
            "full_quality_public_id": processed_public_id,
            "thumbnail_public_id": thumbnail_public_id,
            "thumbnail_url": thumbnail_url,
            "local_thumbnail_generated": True,
            "thumbnail_size_bytes": len(thumbnail_bytes),
            "premium_size_bytes": len(optimized_premium_bytes),
            "mode": "hybrid_secure_integration",
            "device_used": processor.device if processor else "unknown"
        }

        logger.info(f"Job {job_id} completed successfully with text-to-image generation")
        return processed_url, processing_info

    except Exception as e:
        logger.error(f"Job {job_id} failed: {e}")
        raise ImageProcessingError(f"Text-to-image generation failed: {e}")

    finally:
        # Clean up
        if processor is not None:
            processor._clear_memory()