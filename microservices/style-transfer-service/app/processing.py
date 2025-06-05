"""
Style transfer processing module using OmniConsistency model.
Implements AI-powered artistic style transfer with various art styles.
"""

import logging
import time
import traceback
from typing import Dict, Tuple, Any, Optional, Set
import io
import threading
from PIL import Image
import torch
import numpy as np
from diffusers import FluxPipeline
import gc

from app.cloudinary_service import CloudinaryService
from app.config import (
    MODEL_NAME, DEVICE, MAX_SEQUENCE_LENGTH, INFERENCE_STEPS, 
    GUIDANCE_SCALE, AVAILABLE_STYLES, MODELS_DIR
)
from app.dto import StyleTransferConfigDTO, StyleQuality

logger = logging.getLogger(__name__)

class StyleTransferError(Exception):
    """Custom exception for style transfer processing errors."""
    pass

# Global pipeline cache
_pipeline_cache: Optional[FluxPipeline] = None
_pipeline_lock = threading.Lock()

# Job tracking to prevent duplicates
_active_jobs: Set[str] = set()
_jobs_lock = threading.Lock()

def clear_cache():
    """Clear the pipeline cache and free GPU memory."""
    global _pipeline_cache
    with _pipeline_lock:
        if _pipeline_cache is not None:
            # Clear transformer cache if available
            if hasattr(_pipeline_cache, 'transformer'):
                if hasattr(_pipeline_cache.transformer, 'clear_cache'):
                    _pipeline_cache.transformer.clear_cache()
            
            del _pipeline_cache
            _pipeline_cache = None
            
            # Force garbage collection
            gc.collect()
            
            # Clear CUDA cache if using GPU
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
                
            logger.info("🧹 Cleared pipeline cache and freed memory")

def get_pipeline() -> FluxPipeline:
    """Get or create the OmniConsistency pipeline."""
    global _pipeline_cache
    
    with _pipeline_lock:
        if _pipeline_cache is None:
            logger.info(f"🔧 Loading OmniConsistency pipeline from {MODEL_NAME}")
            try:
                # Load the pipeline with appropriate settings
                _pipeline_cache = FluxPipeline.from_pretrained(
                    MODEL_NAME,
                    torch_dtype=torch.float16 if DEVICE == "cuda" else torch.float32,
                    device_map="auto" if DEVICE == "cuda" else None,
                    low_cpu_mem_usage=True,
                    trust_remote_code=True
                )
                
                if DEVICE == "cuda":
                    _pipeline_cache = _pipeline_cache.to("cuda")
                    # Enable memory efficient attention if available
                    if hasattr(_pipeline_cache, "enable_attention_slicing"):
                        _pipeline_cache.enable_attention_slicing()
                    if hasattr(_pipeline_cache, "enable_vae_slicing"):
                        _pipeline_cache.enable_vae_slicing()
                
                logger.info(f"✅ Successfully loaded OmniConsistency pipeline on {DEVICE}")
                
            except Exception as e:
                logger.error(f"❌ Failed to load OmniConsistency pipeline: {e}")
                raise StyleTransferError(f"Failed to load model: {e}")
        
        return _pipeline_cache

def create_style_prompt(style: str, custom_prompt: Optional[str] = None) -> str:
    """Create an effective prompt for the given style."""
    base_prompts = {
        "3D_Chibi": "3D Chibi style, cute character design, rounded features",
        "American_Cartoon": "American cartoon style, vibrant colors, clean lines",
        "Chinese_Ink": "Chinese ink painting style, traditional brushwork, monochrome",
        "Clay_Toy": "Clay toy style, handmade appearance, soft textures",
        "Fabric": "Fabric texture style, textile appearance, soft materials",
        "Ghibli": "Studio Ghibli style, anime, detailed backgrounds, warm colors",
        "Irasutoya": "Irasutoya illustration style, simple clean design",
        "Jojo": "JoJo's Bizarre Adventure style, dramatic poses, bold lines",
        "LEGO": "LEGO brick style, blocky construction, plastic appearance",
        "Line": "Line art style, black and white, minimal shading",
        "Macaron": "Macaron style, pastel colors, sweet aesthetic",
        "Oil_Painting": "Oil painting style, thick brushstrokes, classical art",
        "Origami": "Origami paper folding style, geometric shapes",
        "Paper_Cutting": "Paper cutting art style, layered design",
        "Picasso": "Picasso cubist style, abstract geometric forms",
        "Pixel": "Pixel art style, 8-bit graphics, retro gaming",
        "Poly": "Low poly style, geometric faceted design",
        "Pop_Art": "Pop art style, bright colors, bold graphics",
        "Rick_Morty": "Rick and Morty animation style, cartoon sci-fi",
        "Snoopy": "Snoopy Peanuts style, simple line drawings",
        "Van_Gogh": "Van Gogh style, swirling brushstrokes, post-impressionist",
        "Vector": "Vector art style, clean geometric shapes, flat design"
    }
    
    base_prompt = base_prompts.get(style, f"{style} style")
    
    if custom_prompt:
        return f"{base_prompt}, {custom_prompt}"
    else:
        return base_prompt

async def perform_style_transfer(
    job_id: str,
    image_url: str,
    config: Dict[str, Any]
) -> Tuple[str, Dict[str, Any]]:
    """
    Perform style transfer on an image using OmniConsistency.
    
    Args:
        job_id: Unique job identifier
        image_url: URL of the source image
        config: Style transfer configuration
        
    Returns:
        Tuple of (processed_image_url, processing_params)
    """
    
    # Verify job tracking
    with _jobs_lock:
        if job_id in _active_jobs:
            error_msg = f"🚫 Style transfer job {job_id} already being processed"
            logger.warning(error_msg)
            raise StyleTransferError(error_msg)
        
        _active_jobs.add(job_id)
        logger.info(f"📝 Style transfer job {job_id} added to active list")

    try:
        logger.info(f"🎨 Starting style transfer for job {job_id}")
        
        # Parse and validate configuration
        try:
            style_config = StyleTransferConfigDTO(**config)
        except Exception as e:
            raise StyleTransferError(f"Invalid style transfer configuration: {e}")
        
        # Download the source image
        logger.info(f"⬇️ Downloading source image from: {image_url}")
        input_image_bytes = CloudinaryService.download_image_from_url(image_url)
        
        # Load and prepare the source image
        source_image = Image.open(io.BytesIO(input_image_bytes)).convert("RGB")
        original_size = source_image.size
        logger.info(f"📐 Original image size: {original_size}")
        
        # Get the pipeline
        pipe = get_pipeline()
        
        # Prepare parameters based on quality
        if style_config.quality == StyleQuality.PREMIUM:
            width, height = 1024, 1024
            num_inference_steps = 35
            guidance_scale = 4.0
        else:
            width, height = 512, 512
            num_inference_steps = 20
            guidance_scale = 3.5
        
        # Resize source image if needed while maintaining aspect ratio
        aspect_ratio = original_size[0] / original_size[1]
        if aspect_ratio > 1:  # Landscape
            new_width = width
            new_height = int(width / aspect_ratio)
        else:  # Portrait or square
            new_height = height
            new_width = int(height * aspect_ratio)
        
        # Ensure dimensions are even and within limits
        new_width = min(new_width, width) & ~1
        new_height = min(new_height, height) & ~1
        
        resized_image = source_image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Create the style prompt
        style_prompt = create_style_prompt(
            style_config.style.value, 
            style_config.prompt
        )
        
        logger.info(f"🎭 Applying style: {style_config.style.value}")
        logger.info(f"📝 Using prompt: {style_prompt}")
        logger.info(f"⚙️ Quality: {style_config.quality.value}")
        logger.info(f"💪 Strength: {style_config.strength}")
        
        # Perform style transfer
        start_time = time.perf_counter()
        
        try:
            with torch.no_grad():
                result = pipe(
                    prompt=style_prompt,
                    height=new_height,
                    width=new_width,
                    guidance_scale=guidance_scale,
                    num_inference_steps=num_inference_steps,
                    max_sequence_length=MAX_SEQUENCE_LENGTH,
                    generator=torch.Generator(DEVICE).manual_seed(42),
                    spatial_images=[resized_image],
                    subject_images=[],
                    cond_size=min(new_width, new_height),
                    strength=style_config.strength
                )
                
                styled_image = result.images[0]
                
        except Exception as e:
            logger.error(f"❌ Style transfer inference failed: {e}")
            raise StyleTransferError(f"Style transfer failed: {e}")
        
        processing_time = time.perf_counter() - start_time
        logger.info(f"⏱️ Style transfer completed in {processing_time:.2f} seconds")
        
        # Clear cache after generation
        if hasattr(pipe, 'transformer'):
            clear_cache()
        
        # Convert result to bytes
        output_buffer = io.BytesIO()
        styled_image.save(output_buffer, format="PNG", optimize=True)
        output_bytes = output_buffer.getvalue()
        
        # Create thumbnail
        thumbnail = styled_image.copy()
        thumbnail.thumbnail((400, 300), Image.Resampling.LANCZOS)
        thumbnail_buffer = io.BytesIO()
        thumbnail.save(thumbnail_buffer, format="PNG", optimize=True, quality=70)
        thumbnail_bytes = thumbnail_buffer.getvalue()
        
        # Upload to Cloudinary
        logger.info(f"☁️ Uploading styled image to Cloudinary")
        processed_url, processed_public_id = CloudinaryService.upload_processed_image(
            output_bytes, job_id, f"styled_{style_config.style.value.lower()}"
        )
        
        logger.info(f"☁️ Uploading thumbnail to Cloudinary")
        thumbnail_url, thumbnail_public_id = CloudinaryService.upload_thumbnail(
            thumbnail_bytes, job_id
        )
        
        # Prepare processing parameters
        processing_params = {
            "model_name": MODEL_NAME,
            "style": style_config.style.value,
            "prompt": style_prompt,
            "custom_prompt": style_config.prompt,
            "strength": style_config.strength,
            "quality_level": style_config.quality.value,
            "inference_steps": num_inference_steps,
            "guidance_scale": guidance_scale,
            "original_size": f"{original_size[0]}x{original_size[1]}",
            "output_size": f"{new_width}x{new_height}",
            "processing_time_seconds": round(processing_time, 3),
            "device": DEVICE,
            "thumbnail_url": thumbnail_url,
            "thumbnail_public_id": thumbnail_public_id,
            "processed_public_id": processed_public_id,
            "is_premium": style_config.quality == StyleQuality.PREMIUM,
            "job_id": job_id,
            "timestamp": time.time()
        }
        
        logger.info(f"✅ Style transfer job {job_id} completed successfully")
        logger.info(f"🔗 Styled image URL: {processed_url}")
        logger.info(f"🔗 Thumbnail URL: {thumbnail_url}")
        
        return processed_url, processing_params
        
    except Exception as e:
        logger.error(f"❌ Error in style transfer job {job_id}: {e}")
        logger.error(f"📋 Traceback: {traceback.format_exc()}")
        raise StyleTransferError(f"Style transfer failed for job {job_id}: {e}")
    
    finally:
        # Always remove job from active set
        with _jobs_lock:
            _active_jobs.discard(job_id)
            logger.info(f"🗑️ Style transfer job {job_id} removed from active list")

def get_system_status() -> Dict[str, Any]:
    """Get current system status for monitoring."""
    with _jobs_lock:
        return {
            "active_jobs_count": len(_active_jobs),
            "active_jobs": list(_active_jobs),
            "pipeline_loaded": _pipeline_cache is not None,
            "available_styles": AVAILABLE_STYLES,
            "device": DEVICE,
            "model_name": MODEL_NAME,
            "timestamp": time.time()
        }

def force_reset_system():
    """Emergency system reset function."""
    global _active_jobs
    logger.warning("🚨 FORCE RESET: Style transfer system")
    
    with _jobs_lock:
        _active_jobs.clear()
    
    clear_cache()
    logger.warning("🚨 Style transfer system reset completed")