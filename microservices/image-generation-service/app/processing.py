import logging
import os
import cv2
import numpy as np
import asyncio
from typing import Dict, Tuple, Any, Optional
from PIL import Image
import torch
from diffusers import (
    StableDiffusionPipeline, 
    EulerAncestralDiscreteScheduler,
)
import gc
import hashlib
import threading

from app.cloudinary_service import CloudinaryService
from app.config import MODELS_DIR
from app.local_image_processing import LocalImageProcessor
from app.dto import ImageGenerationConfigDTO

logger = logging.getLogger(__name__)

class ImageProcessingError(Exception):
    """Custom exception for image processing errors."""
    pass

class TextToImageProcessor:
    """Memory-optimized text-to-image generation processor."""
    
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
        self._current_jobs = set()
        
        # Reduced resolutions for memory optimization
        self.resolutions = {
    "square": (512, 512),
    "portrait": (448, 576),
    "landscape": (576, 448),
}


        
        # Cache for processed prompts (reduced size)
        self._prompt_cache = {}
        self._cache_size_limit = 20  # Reduced from 100
        
        # CPU optimization settings
        self._cpu_thread_count = min(4, os.cpu_count() or 1)
        
        self._initialized = True
        logger.info(f"Memory-optimized processor initialized on device: {self.device}")

    def _generate_job_hash(self, prompt: str, config: Dict) -> str:
        """Generate unique hash for job to prevent duplicates."""
        job_data = f"{prompt}_{config.get('aspectRatio', 'square')}"
        return hashlib.md5(job_data.encode()).hexdigest()

    def _aggressive_memory_clear(self):
        """Aggressive memory clearing for low-memory environments."""
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            torch.cuda.ipc_collect()
        
        # Clear Python garbage collection
        for _ in range(3):  # Multiple passes for thorough cleanup
            gc.collect()
        
        # Clear prompt cache if it's getting large
        if len(self._prompt_cache) > self._cache_size_limit:
            self._prompt_cache.clear()

    def _load_model(self) -> bool:
        """Load highly optimized Stable Diffusion model for low memory."""
        if self.model_loaded:
            return True

        try:
            logger.info("Loading memory-optimized Stable Diffusion model...")
            self._aggressive_memory_clear()

            model_id = "SG161222/Realistic_Vision_V5.1_noVAE"
            
            # Use float32 for CPU, float16 only for GPU with sufficient memory
            dtype = torch.float32 if self.device == "cpu" else torch.float16
            
            # Maximum memory optimization parameters
            self.pipeline = StableDiffusionPipeline.from_pretrained(
                model_id,
                torch_dtype=dtype,
                safety_checker=None,
                requires_safety_checker=False,
                cache_dir=MODELS_DIR,
                low_cpu_mem_usage=True,
                use_safetensors=True,
                variant=None,  # Don't use fp16 variant to save memory
                local_files_only=False,
                resume_download=True
            )
            
            # Apply all possible memory optimizations
            if self.device == "cuda":
                try:
                    # Enable all CUDA memory optimizations
                    self.pipeline.enable_memory_efficient_attention()
                    self.pipeline.enable_attention_slicing("auto")
                    self.pipeline.enable_sequential_cpu_offload()
                    self.pipeline.enable_model_cpu_offload()
                    
                    # Use minimal VRAM
                    self.pipeline.vae.enable_tiling()
                    self.pipeline.vae.enable_slicing()
                except Exception as e:
                    logger.warning(f"Some CUDA optimizations failed: {e}")
            else:
                # CPU-specific optimizations
                try:
                    # Enable CPU optimizations
                    self.pipeline.enable_attention_slicing("auto")
                    self.pipeline.enable_sequential_cpu_offload()
                    
                    # Set CPU thread count
                    torch.set_num_threads(self._cpu_thread_count)
                    
                    # Enable VAE optimizations for CPU
                    self.pipeline.vae.enable_tiling()
                    self.pipeline.vae.enable_slicing()
                except Exception as e:
                    logger.warning(f"Some CPU optimizations failed: {e}")

            # Use fastest scheduler
            self.pipeline.scheduler = EulerAncestralDiscreteScheduler.from_config(
                self.pipeline.scheduler.config
            )

            # Move to device after all optimizations
            self.pipeline = self.pipeline.to(self.device)
            
            # Compile model for better performance (if supported)
            if hasattr(torch, 'compile') and self.device == "cuda":
                try:
                    self.pipeline.unet = torch.compile(self.pipeline.unet, mode="reduce-overhead")
                except:
                    pass

            self.model_loaded = True
            logger.info("Memory-optimized model loaded successfully!")
            return True

        except Exception as e:
            logger.error(f"Model loading failed: {e}")
            self._aggressive_memory_clear()
            return False

    def _enhance_prompt(self, prompt: str) -> str:
        """Simplified prompt enhancement to save memory."""
        base_prompt = prompt.strip()
        
        # Minimal enhancement to save memory
        enhancers = [
            "high quality", "detailed", "full view", "well framed"
        ]
        
        return f"{base_prompt}, {', '.join(enhancers)}"

    def _get_negative_prompt(self, custom_negative: str = None) -> str:
        """Simplified negative prompt."""
        base_negative = [
    "deformed iris", "deformed pupils", "semi-realistic", "cgi", "3d", "render",
    "sketch", "cartoon", "drawing", "anime:1.4", "text", "close up", "cropped",
    "out of frame", "worst quality", "low quality", "jpeg artifacts", "ugly",
    "duplicate", "morbid", "mutilated", "extra fingers", "mutated hands",
    "poorly drawn hands", "poorly drawn face", "mutation", "deformed", "blurry",
    "dehydrated", "bad anatomy", "bad proportions", "extra limbs", "cloned face",
    "disfigured", "gross proportions", "malformed limbs", "missing arms",
    "missing legs", "extra arms", "extra legs", "fused fingers", "too many fingers",
    "long neck"
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
        steps: int = 20,  # Default value, user can override
        guidance_scale: float = 7.5,  # Default value, user can override
        **kwargs
    ) -> np.ndarray:
        """
        Memory-optimized image generation.
        """
        # Check for duplicate jobs
        job_hash = self._generate_job_hash(prompt, {
            'aspectRatio': aspect_ratio
        })
        
        if job_hash in self._current_jobs:
            logger.warning(f"Duplicate job detected for {job_id}, skipping...")
            raise ImageProcessingError("Duplicate job detected")
        
        self._current_jobs.add(job_hash)
        
        try:
            # Load model if not already loaded
            if not self._load_model():
                raise RuntimeError("Failed to load the text-to-image model")

            # Get resolution (smaller for memory optimization)
            width, height = self.resolutions.get(aspect_ratio, self.resolutions["square"])

            # Minimal prompt enhancement
            enhanced_prompt = self._enhance_prompt(prompt)
            full_negative_prompt = self._get_negative_prompt(negative_prompt)
            
            logger.info(f"Generating image for {job_id}: {width}x{height}, steps={steps}, guidance={guidance_scale}")

            # Clear memory before generation
            self._aggressive_memory_clear()
            
            # Use deterministic seed for consistency
            generator = torch.Generator(device=self.device).manual_seed(42)
            
            # Generate image with memory-optimized settings
            with torch.inference_mode():
                with torch.autocast(self.device, enabled=self.device=="cuda"):
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

            # Immediate memory cleanup
            self._aggressive_memory_clear()

            # Convert to BGR with minimal memory usage
            result_array = np.array(result)
            result_bgr = cv2.cvtColor(result_array, cv2.COLOR_RGB2BGR)
            
            # Clear the PIL image
            result.close()
            del result_array

            logger.info(f"Image generation completed for {job_id}")
            return result_bgr

        except Exception as e:
            logger.error(f"Image generation failed for {job_id}: {e}")
            raise
        finally:
            # Remove from active jobs and clear memory
            self._current_jobs.discard(job_hash)
            self._aggressive_memory_clear()

    def unload_model(self):
        """Unload model to free memory completely."""
        if self.pipeline is not None:
            del self.pipeline
            self.pipeline = None
            self.model_loaded = False
            self._aggressive_memory_clear()
            logger.info("Model unloaded to free memory")

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
    Memory-optimized main function for text-to-image generation.
    """
    # Set CPU thread count for optimal performance
    torch.set_num_threads(min(4, os.cpu_count() or 1))
    
    try:
        os.makedirs(MODELS_DIR, exist_ok=True)

        # Parse configuration
        generation_config = ImageGenerationConfigDTO(**config)

        if not generation_config.validate_prompt():
            raise ValueError("Invalid prompt")

        logger.info(f"Starting memory-optimized generation for job {job_id}")

        # Get processor instance
        processor = await get_processor()

        # Extract steps and guidance_scale from config (user-controlled)
        steps = generation_config.steps if hasattr(generation_config, 'steps') and generation_config.steps else 20
        guidance_scale = generation_config.guidanceScale if hasattr(generation_config, 'guidanceScale') and generation_config.guidanceScale else 7.5

        # Generate image
        output_image = await processor.generate_image(
            job_id=job_id,
            prompt=generation_config.prompt,
            aspect_ratio=generation_config.aspectRatio.value,
            negative_prompt=generation_config.negativePrompt,
            steps=steps,
            guidance_scale=guidance_scale
        )

        # Memory-optimized encoding
        encode_params = [cv2.IMWRITE_PNG_COMPRESSION, 9]  # Higher compression to save memory
        is_success, buffer = cv2.imencode('.png', output_image, encode_params)

        if not is_success:
            raise RuntimeError("Failed to encode output image")

        output_bytes = buffer.tobytes()
        
        # Clear buffer immediately
        del buffer

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
            "processing_type": "text_to_image_generation_memory_optimized",
            "model": "stable-diffusion-v1-5-memory-optimized",
            "prompt": generation_config.prompt,
            "aspect_ratio": generation_config.aspectRatio.value,
            "output_size": f"{output_w}x{output_h}",
            "steps": steps,
            "guidance_scale": guidance_scale,
            "full_quality_public_id": processed_public_id,
            "thumbnail_public_id": thumbnail_public_id,
            "thumbnail_url": thumbnail_url,
            "device_used": processor.device,
            "optimizations_applied": [
                "reduced_resolution", 
                "aggressive_memory_clearing", 
                "cpu_optimized",
                "vae_tiling",
                "attention_slicing",
                "sequential_cpu_offload"
            ]
        }

        logger.info(f"Job {job_id} completed successfully")
        return processed_url, processing_info

    except Exception as e:
        logger.error(f"Job {job_id} failed: {e}")
        raise ImageProcessingError(f"Image generation failed: {e}")

    finally:
        # Ensure memory is cleared
        if 'processor' in locals():
            processor._aggressive_memory_clear()
        
        # Optional: Unload model after each job to save maximum memory
        # Uncomment if you want to unload model after each generation
        # if 'processor' in locals():
        #     processor.unload_model()