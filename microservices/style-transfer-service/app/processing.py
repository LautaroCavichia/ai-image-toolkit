"""
Ultra-lightweight style transfer processing module - CPU ONLY.
Optimized for minimal memory usage and CPU processing.
"""

import logging
import time
import traceback
from typing import Dict, Tuple, Any, Optional, Set
import io
import threading
import os
from PIL import Image, ImageFilter, ImageEnhance
import torch
import numpy as np
from diffusers import (
    StableDiffusionPipeline,
    StableDiffusionImg2ImgPipeline,
    DiffusionPipeline
)
from diffusers.schedulers import (
    DDIMScheduler, 
    EulerDiscreteScheduler,
    LMSDiscreteScheduler
)
import gc

from app.cloudinary_service import CloudinaryService
from app.config import DEVICE, MODELS_DIR, AVAILABLE_STYLES
from app.dto import StyleTransferConfigDTO, StyleQuality
from app.local_image_processing import LocalImageProcessor

logger = logging.getLogger(__name__)

class StyleTransferError(Exception):
    """Custom exception for style transfer processing errors."""
    pass

# Global pipeline cache
_pipeline_cache: Optional[StableDiffusionImg2ImgPipeline] = None
_pipeline_lock = threading.Lock()

# Job tracking to prevent duplicates
_active_jobs: Set[str] = set()
_jobs_lock = threading.Lock()


LIGHTWEIGHT_CPU_MODELS = [
    {
        "name": "runwayml/stable-diffusion-v1-5", 
        "size_gb": 1.2,
        "use_img2img": True,
        "torch_dtype": torch.float32,  
        "cpu_optimized": True
    },
    {
        "name": "stabilityai/stable-diffusion-2-base", 
        "size_gb": 2.0,
        "use_img2img": True,
        "torch_dtype": torch.float32,
        "cpu_optimized": True
    }
]

def aggressive_cpu_memory_cleanup():
    """Limpieza extrema de memoria para CPU."""
    gc.collect()
    # Limpiar caché de numpy
    if hasattr(np, 'clear_cache'):
        np.clear_cache()
    
    # Forzar recolección múltiple
    for _ in range(3):
        gc.collect()

def check_cpu_memory():
    """Verificar memoria RAM disponible."""
    try:
        import psutil
        memory = psutil.virtual_memory()
        available_gb = memory.available / 1024**3
        total_gb = memory.total / 1024**3
        used_gb = memory.used / 1024**3
        
        logger.info(f"🖥️ RAM Memory - Total: {total_gb:.1f}GB, Used: {used_gb:.1f}GB, Available: {available_gb:.1f}GB")
        return available_gb > 3.0  # Necesitamos al menos 3GB libres para CPU
    except ImportError:
        logger.warning("psutil not available, assuming sufficient memory")
        return True

def load_ultra_lightweight_cpu_pipeline():
    logger.info("🚀 Loading ultra-lightweight CPU pipeline...")
    try:
        pipeline = StableDiffusionPipeline.from_pretrained(
            "runwayml/stable-diffusion-lite",
            revision="fp16",
            torch_dtype=torch.float16,
            low_cpu_mem_usage=True,
            cache_dir=MODELS_DIR,
        )
        pipeline.to("cpu")
        return pipeline
    except Exception as e:
        logger.error(f"Failed to load ultra-lightweight CPU pipeline: {e}")
        raise

def get_pipeline() -> StableDiffusionImg2ImgPipeline:
    """Get or create the ultra-lightweight CPU pipeline."""
    global _pipeline_cache
    
    with _pipeline_lock:
        if _pipeline_cache is None:
            _pipeline_cache = load_ultra_lightweight_cpu_pipeline()
        return _pipeline_cache

def create_simple_style_prompt(style: str, custom_prompt: Optional[str] = None) -> Tuple[str, str]:
    """Create ultra-simple prompts for CPU processing."""
    
   
    simple_style_prompts = {
        "3D_Chibi": ("3D chibi", "realistic"),
        "American_Cartoon": ("cartoon", "photo"),
        "Chinese_Ink": ("ink art", "color"),
        "Clay_Toy": ("clay", "metal"),
        "Fabric": ("fabric", "hard"),
        "Ghibli": ("anime", "realistic"),
        "Oil_Painting": ("painting", "photo"), 
        "Van_Gogh": ("Van Gogh", "modern"),
        "Pixel": ("pixel art", "smooth"),
        "Pop_Art": ("pop art", "dull"),
        "Vector": ("vector", "textured"),
        "Watercolor": ("watercolor", "digital")
    }
    
    if style in simple_style_prompts:
        positive_base, negative_base = simple_style_prompts[style]
    else:
        positive_base = style.replace('_', ' ')
        negative_base = "bad"
    
 
    if custom_prompt and len(custom_prompt) < 50:  
        positive_prompt = f"{positive_base}, {custom_prompt[:30]}"
    else:
        positive_prompt = positive_base
    
    negative_prompt = f"{negative_base}, ugly"
    
    return positive_prompt, negative_prompt

def ultra_lightweight_preprocess(image: Image.Image, max_size: int = 256) -> Image.Image:
   
    
    # Convert to RGB
    if image.mode != 'RGB':
        image = image.convert('RGB')
    

    width, height = image.size
    

    if width > height:
        new_width = max_size
        new_height = int((height * max_size) / width)
    else:
        new_height = max_size
        new_width = int((width * max_size) / height)
    
   
    new_width = max(((new_width // 8) * 8), 128)
    new_height = max(((new_height // 8) * 8), 128)
    
 
    processed_image = image.resize((new_width, new_height), Image.Resampling.NEAREST)
    
    return processed_image

async def perform_style_transfer(
    job_id: str,
    image_url: str,
    config: Dict[str, Any]
) -> Tuple[str, Dict[str, Any]]:
    """
    Ultra-lightweight CPU-only style transfer.
    """
    
    # Job tracking
    with _jobs_lock:
        if job_id in _active_jobs:
            error_msg = f"🚫 Job {job_id} already processing"
            logger.warning(error_msg)
            raise StyleTransferError(error_msg)
        _active_jobs.add(job_id)

    try:
        logger.info(f"🎨 Starting CPU-only style transfer: {job_id}")
        
        # Parse config
        try:
            style_config = StyleTransferConfigDTO(**config)
        except Exception as e:
            raise StyleTransferError(f"Invalid config: {e}")
        
        # Download image
        logger.info(f"⬇️ Downloading image...")
        input_bytes = CloudinaryService.download_image_from_url(image_url)
        
        # Load and preprocess
        source_image = Image.open(io.BytesIO(input_bytes))
        original_size = source_image.size
        logger.info(f"📐 Original: {original_size}")
        
   
        max_size = 256 if style_config.quality == StyleQuality.PREMIUM else 128
        processed_image = ultra_lightweight_preprocess(source_image, max_size)
        final_size = processed_image.size
        logger.info(f"📐 Processed: {final_size}")
        
      
        aggressive_cpu_memory_cleanup()
        
        # Get pipeline
        pipe = get_pipeline()
        
        # Create simple prompts
        positive_prompt, negative_prompt = create_simple_style_prompt(
            style_config.style.value, style_config.prompt
        )
        
        # PARÁMETROS ULTRA CONSERVADORES PARA CPU
        num_inference_steps = 8 if style_config.quality == StyleQuality.PREMIUM else 5
        guidance_scale = 4.0  # Más bajo para CPU
        strength = min(style_config.strength, 0.4)  # Muy conservador para CPU
        
        logger.info(f"🎭 Style: {style_config.style.value}")
        logger.info(f"💪 Strength: {strength}")
        logger.info(f"🔢 Steps: {num_inference_steps}")
        logger.info(f"🖥️ Running on CPU")
        
        # Inferencia en CPU
        start_time = time.perf_counter()
        
        try:
            # Configurar threads para CPU
            torch.set_num_threads(max(1, os.cpu_count() // 2))
            
            with torch.no_grad():
                # No usar generator en CPU para simplicidad
                
                # Parámetros mínimos para CPU
                result = pipe(
                    prompt=positive_prompt,
                    negative_prompt=negative_prompt,
                    image=processed_image,
                    strength=strength,
                    num_inference_steps=num_inference_steps,
                    guidance_scale=guidance_scale,
                    # No usar generator para CPU
                )
                
                styled_image = result.images[0]
                
                # Limpiar inmediatamente
                del result
                aggressive_cpu_memory_cleanup()
                
        except Exception as e:
            logger.error(f"❌ CPU Inference failed: {e}")
            aggressive_cpu_memory_cleanup()
            raise StyleTransferError(f"CPU Inference failed: {e}")
        
        processing_time = time.perf_counter() - start_time
        logger.info(f"⏱️ CPU processing completed in {processing_time:.2f}s")
        
        # Guardar resultado
        output_buffer = io.BytesIO()
        styled_image.save(output_buffer, format="PNG", optimize=True, quality=75)
        output_bytes = output_buffer.getvalue()
        
        # Thumbnail pequeño
        thumbnail = styled_image.copy()
        thumbnail.thumbnail((150, 100), Image.Resampling.NEAREST)
        thumbnail_buffer = io.BytesIO()
        thumbnail.save(thumbnail_buffer, format="PNG", optimize=True, quality=60)
        thumbnail_bytes = thumbnail_buffer.getvalue()
        
        # Upload
        logger.info(f"🖼️ Generating thumbnail locally for {job_id}")
        # Create thumbnail locally for better quality control
        thumbnail_bytes = LocalImageProcessor.create_thumbnail(output_bytes)
        
        # Optimize premium image
        optimized_premium_bytes = LocalImageProcessor.optimize_premium_image(output_bytes)
        
        logger.info(f"☁️ Uploading premium optimized image to Cloudinary for {job_id}")
        processed_url, processed_public_id = CloudinaryService.upload_processed_image(
            optimized_premium_bytes, job_id, f"styled_{style_config.style.value.lower()}"
        )
        
        logger.info(f"☁️ Uploading thumbnail to Cloudinary for {job_id}")
        thumbnail_url, thumbnail_public_id = CloudinaryService.upload_thumbnail(
            thumbnail_bytes, job_id
        )
        
        # Processing parameters
        processing_params = {
            "model_name": "runwayml/stable-diffusion-v1-5",
            "pipeline_type": "ultra_lightweight_cpu",
            "style": style_config.style.value,
            "positive_prompt": positive_prompt,
            "negative_prompt": negative_prompt,
            "custom_prompt": style_config.prompt,
            "strength": strength,
            "quality_level": style_config.quality.value,
            "inference_steps": num_inference_steps,
            "guidance_scale": guidance_scale,
            "original_size": f"{original_size[0]}x{original_size[1]}",
            "output_size": f"{final_size[0]}x{final_size[1]}",
            "processing_time_seconds": round(processing_time, 3),
            "device": "cpu",
            "cpu_threads": torch.get_num_threads(),
            "local_thumbnail_generated": True,
            "thumbnail_size_bytes": len(thumbnail_bytes),
            "premium_size_bytes": len(optimized_premium_bytes),
            "processed_public_id": processed_public_id,
            "thumbnail_public_id": thumbnail_public_id,
            "thumbnail_url": thumbnail_url,
            "mode": "hybrid_secure_integration",
            "is_premium": style_config.quality == StyleQuality.PREMIUM,
            "job_id": job_id,
            "timestamp": time.time(),
            "cpu_optimized": True,
            "ultra_lightweight": True
        }
        
        logger.info(f"✅ CPU Job {job_id} completed successfully")
        logger.info(f"🔗 Result: {processed_url}")
        
        return processed_url, processing_params
        
    except Exception as e:
        logger.error(f"❌ Error in CPU job {job_id}: {e}")
        raise StyleTransferError(f"CPU Job {job_id} failed: {e}")
    
    finally:
        # Cleanup
        with _jobs_lock:
            _active_jobs.discard(job_id)
        aggressive_cpu_memory_cleanup()

def clear_cache():
    """Clear pipeline cache and free memory."""
    global _pipeline_cache
    
    with _pipeline_lock:
        if _pipeline_cache is not None:
            logger.info("🧹 Clearing CPU pipeline cache")
            del _pipeline_cache
            _pipeline_cache = None
    
    aggressive_cpu_memory_cleanup()

def get_system_status() -> Dict[str, Any]:
    """Get current CPU system status."""
    with _jobs_lock:
        memory_info = "N/A"
        try:
            import psutil
            memory = psutil.virtual_memory()
            memory_info = f"Used: {memory.percent:.1f}%, Available: {memory.available/1024**3:.2f}GB"
        except ImportError:
            pass
        
        return {
            "active_jobs_count": len(_active_jobs),
            "active_jobs": list(_active_jobs),
            "pipeline_loaded": _pipeline_cache is not None,
            "available_styles": AVAILABLE_STYLES,
            "device": "cpu",
            "models_directory": MODELS_DIR,
            "cuda_available": False,
            "cpu_only": True,
            "cpu_threads": torch.get_num_threads(),
            "system_memory": memory_info,
            "torch_version": torch.__version__,
            "ultra_optimized": True,
            "cpu_optimized": True,
            "timestamp": time.time()
        }

def force_reset_system():
    """Emergency reset for CPU system."""
    global _active_jobs
    logger.warning("🚨 FORCE RESET: CPU-only system")
    
    with _jobs_lock:
        _active_jobs.clear()
    
    clear_cache()
    logger.warning("🚨 CPU Reset completed")

def clear_active_jobs():
    """Clear active jobs."""
    global _active_jobs
    with _jobs_lock:
        _active_jobs.clear()

def get_active_jobs_count() -> int:
    """Get active jobs count."""
    with _jobs_lock:
        return len(_active_jobs)


def setup_cpu_environment():
    """Configurar entorno para CPU."""
    
    torch.set_num_threads(max(1, os.cpu_count() // 2))
    
   
    os.environ['CUDA_VISIBLE_DEVICES'] = ''
    
    logger.info(f"🖥️ CPU Environment configured - Threads: {torch.get_num_threads()}")


setup_cpu_environment()