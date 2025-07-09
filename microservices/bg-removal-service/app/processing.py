"""
Image processing module for background removal with Cloudinary integration.
ULTRA-AGGRESSIVE MEMORY OPTIMIZATION: Target < 400MB usage through extreme resource management.
STREAMING PROCESSING: No intermediate storage, direct pipeline processing.
MINIMAL FOOTPRINT: Reduced caching, immediate cleanup, compressed operations.
"""

import logging
import time
import traceback
from typing import Dict, Tuple, Any, Set, Optional
import io
import threading
import gc
import os
import sys
import contextlib
from PIL import Image, ImageFilter
from rembg import remove, new_session
import pytesseract
import numpy as np

from app.cloudinary_service import CloudinaryService
from app.local_image_processing import LocalImageProcessor

logger = logging.getLogger(__name__)

class ImageProcessingError(Exception):
    """Specific error for image processing failures."""

# MINIMAL GLOBAL STATE - Only essential tracking
_active_jobs: Set[str] = set()
_jobs_lock = threading.Lock()
_current_session = None
_current_model = None
_session_lock = threading.Lock()

# EXTREME MEMORY LIMITS
MAX_IMAGE_DIMENSION = 2048  # Limit max image size
MAX_DETECTION_PIXELS = 30000  # Ultra-small detection sample
MEMORY_CLEANUP_FREQUENCY = 1  # Clean after every job

class UltraMemoryManager:
    """Ultra-aggressive memory management context."""
    
    def __init__(self, operation_name: str = "operation"):
        self.operation_name = operation_name
        self.initial_objects = None
    
    def __enter__(self):
        gc.collect()
        self.initial_objects = len(gc.get_objects())
        logger.debug(f"🔧 {self.operation_name} - Start objects: {self.initial_objects}")
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        # Force cleanup
        gc.collect()
        gc.collect()  # Double cleanup
        final_objects = len(gc.get_objects())
        logger.debug(f"🧹 {self.operation_name} - End objects: {final_objects}")

def force_memory_cleanup():
    """Nuclear memory cleanup option."""
    global _current_session, _current_model
    
    # Clear everything possible
    with _session_lock:
        _current_session = None
        _current_model = None
    
    # Force Python garbage collection
    for _ in range(3):
        gc.collect()
    
    # Force PIL cleanup
    try:
        from PIL import Image
        Image.MAX_IMAGE_PIXELS = None
    except:
        pass
    
    logger.info("🧹 Nuclear memory cleanup executed")

def get_active_jobs_count() -> int:
    """Returns active job count."""
    with _jobs_lock:
        return len(_active_jobs)

def clear_active_jobs():
    """Clear all active jobs."""
    with _jobs_lock:
        _active_jobs.clear()

def get_minimal_session(model_name: str):
    """
    MINIMAL SESSION MANAGEMENT: Only one session at a time.
    Immediately dispose of old sessions.
    """
    global _current_session, _current_model
    
    with _session_lock:
        # If we need a different model, destroy current session
        if _current_model != model_name:
            if _current_session is not None:
                logger.info(f"🗑️ Disposing old session: {_current_model}")
                _current_session = None
                force_memory_cleanup()
            
            logger.info(f"🔧 Creating minimal session: {model_name}")
            _current_session = new_session(model_name)
            _current_model = model_name
        
        return _current_session

def compress_image_for_processing(image_bytes: bytes, max_dimension: int = MAX_IMAGE_DIMENSION) -> bytes:
    """
    AGGRESSIVE IMAGE COMPRESSION: Reduce size before any processing.
    """
    with UltraMemoryManager("compress"):
        image = Image.open(io.BytesIO(image_bytes))
        
        try:
            width, height = image.size
            
            # If image is too large, compress it
            if width > max_dimension or height > max_dimension:
                # Calculate new size maintaining aspect ratio
                if width > height:
                    new_width = max_dimension
                    new_height = int((height * max_dimension) / width)
                else:
                    new_height = max_dimension
                    new_width = int((width * max_dimension) / height)
                
                logger.info(f"📐 Compressing {width}x{height} → {new_width}x{new_height}")
                
                # Use fastest resampling for memory efficiency
                compressed = image.resize((new_width, new_height), Image.Resampling.NEAREST)
                
                # Save compressed version
                buffer = io.BytesIO()
                compressed.save(buffer, format='PNG', optimize=True, compress_level=9)
                result = buffer.getvalue()
                buffer.close()
                compressed.close()
                
                logger.info(f"📦 Compressed: {len(image_bytes)} → {len(result)} bytes")
                return result
            else:
                # Image is already small enough
                return image_bytes
                
        finally:
            image.close()

def minimal_signature_detection(image_bytes: bytes) -> str:
    """
    ULTRA-MINIMAL signature detection with extreme memory limits.
    """
    with UltraMemoryManager("signature_detection"):
        # First compress to tiny size for detection
        image = Image.open(io.BytesIO(image_bytes))
        
        try:
            # Ultra-small detection sample
            width, height = image.size
            pixels = width * height
            
            if pixels > MAX_DETECTION_PIXELS:
                # Extreme downsampling for detection
                ratio = (MAX_DETECTION_PIXELS / pixels) ** 0.5
                new_width = max(50, int(width * ratio))
                new_height = max(50, int(height * ratio))
                detection_image = image.resize((new_width, new_height), Image.Resampling.NEAREST)
            else:
                detection_image = image
            
            # Convert to grayscale for minimal processing
            gray = detection_image.convert("L")
            
            # Minimal array analysis
            np_array = np.array(gray, dtype=np.uint8)
            
            # Quick statistical checks
            light_pixels = np.sum(np_array > 200)
            total_pixels = np_array.size
            light_ratio = light_pixels / total_pixels
            
            # Simple signature heuristic
            is_signature = light_ratio > 0.85
            
            result = "isnet-general-use" if is_signature else "u2net"
            
            logger.info(f"🎯 Detection result: {result} (light_ratio: {light_ratio:.2f})")
            
            return result
            
        finally:
            if 'detection_image' in locals() and detection_image != image:
                detection_image.close()
            if 'gray' in locals():
                gray.close()
            image.close()

def stream_process_image(image_bytes: bytes, model_name: str) -> bytes:
    """
    STREAMING IMAGE PROCESSING: Direct pipeline without intermediate storage.
    """
    with UltraMemoryManager("stream_process"):
        # Step 1: Compress input
        compressed_bytes = compress_image_for_processing(image_bytes)
        
        # Clear original immediately
        del image_bytes
        force_memory_cleanup()
        
        # Step 2: Get session
        session = get_minimal_session(model_name)
        
        # Step 3: Process with rembg
        logger.info(f"🎨 Processing with {model_name}")
        processed_bytes = remove(compressed_bytes, session=session)
        
        # Clear compressed immediately
        del compressed_bytes
        force_memory_cleanup()
        
        # Step 4: Ensure PNG format
        image = Image.open(io.BytesIO(processed_bytes))
        
        try:
            # Quick format check and fix
            if image.mode != 'RGBA':
                image = image.convert('RGBA')
            
            # Stream to final format
            output_buffer = io.BytesIO()
            image.save(output_buffer, format='PNG', optimize=True, compress_level=9)
            final_bytes = output_buffer.getvalue()
            output_buffer.close()
            
            return final_bytes
            
        finally:
            image.close()
            del processed_bytes
            force_memory_cleanup()

def create_minimal_thumbnail(image_bytes: bytes, size: int = 150) -> bytes:
    """
    MINIMAL THUMBNAIL CREATION: Direct streaming, no intermediate storage.
    """
    memory_thumb_start = get_memory_usage()
    logger.info(f"🖼️ Thumbnail creation start: {memory_thumb_start:.1f}MB")
    
    with UltraMemoryManager("thumbnail"):
        image = Image.open(io.BytesIO(image_bytes))
        
        try:
            # Create thumbnail directly
            thumbnail = image.copy()
            thumbnail.thumbnail((size, size), Image.Resampling.LANCZOS)
            
            # Stream to bytes
            thumb_buffer = io.BytesIO()
            thumbnail.save(thumb_buffer, format='PNG', optimize=True, compress_level=9)
            thumb_bytes = thumb_buffer.getvalue()
            thumb_buffer.close()
            thumbnail.close()
            
            memory_thumb_end = get_memory_usage()
            logger.info(f"🖼️ Thumbnail creation end: {memory_thumb_start:.1f}MB → {memory_thumb_end:.1f}MB")
            
            return thumb_bytes
            
        finally:
            image.close()

async def perform_background_removal(
    job_id: str,
    image_url: str,
    config: Dict[str, Any]
) -> Tuple[str, Dict[str, Any]]:
    
    logger.info(f"🚀 ULTRA-OPTIMIZED JOB: {job_id}")
    
    # Check for duplicates
    with _jobs_lock:
        if job_id in _active_jobs:
            raise ImageProcessingError(f"Job {job_id} already processing")
        _active_jobs.add(job_id)

    try:
        with UltraMemoryManager("full_job"):
            
            # STEP 1: Download with immediate processing
            logger.info(f"⬇️ Downloading: {image_url}")
            original_bytes = CloudinaryService.download_image_from_url(image_url)
            
            # STEP 2: Detect model with minimal footprint
            model_name = minimal_signature_detection(original_bytes)
            
            # STEP 3: Process image with streaming
            start_time = time.perf_counter()
            
            processed_bytes = stream_process_image(original_bytes, model_name)
            
            # Clear original immediately
            del original_bytes
            force_memory_cleanup()
            
            elapsed = time.perf_counter() - start_time
            
            # STEP 4: Create thumbnail
            thumbnail_bytes = create_minimal_thumbnail(processed_bytes)
            
            # STEP 5: Upload premium version
            logger.info(f"☁️ Uploading premium")
            processed_url, processed_public_id = CloudinaryService.upload_processed_image(
                processed_bytes, job_id, "bg_removed"
            )
            
            # Get size before clearing
            premium_size = len(processed_bytes)
            del processed_bytes
            force_memory_cleanup()
            
            # STEP 6: Upload thumbnail
            logger.info(f"☁️ Uploading thumbnail")
            thumbnail_url, thumbnail_public_id = CloudinaryService.upload_thumbnail(
                thumbnail_bytes, job_id
            )
            
            # Get size before clearing
            thumbnail_size = len(thumbnail_bytes)
            del thumbnail_bytes
            force_memory_cleanup()
            
            logger.info(f"✅ Job {job_id} completed in {elapsed:.2f}s")
            
            return processed_url, {
                "model_version": model_name,
                "mode": "ultra_minimal_memory",
                "processing_time_seconds": round(elapsed, 3),
                "full_quality_public_id": processed_public_id,
                "thumbnail_public_id": thumbnail_public_id,
                "thumbnail_url": thumbnail_url,
                "thumbnail_size_bytes": thumbnail_size,
                "premium_size_bytes": premium_size,
                "job_id": job_id,
                "timestamp": time.time(),
                "memory_ultra_optimized": True
            }

    except Exception as e:
        logger.error(f"❌ Job {job_id} failed: {e}")
        raise ImageProcessingError(f"Job {job_id} failed: {e}")
    
    finally:
        # Always cleanup
        with _jobs_lock:
            _active_jobs.discard(job_id)
        
        # Force cleanup after every job
        force_memory_cleanup()

def get_system_status() -> Dict[str, Any]:
    """Minimal system status."""
    return {
        "active_jobs_count": get_active_jobs_count(),
        "current_model": _current_model,
        "has_session": _current_session is not None,
        "memory_mode": "ultra_minimal",
        "max_image_dimension": MAX_IMAGE_DIMENSION,
        "max_detection_pixels": MAX_DETECTION_PIXELS
    }

def force_reset_system():
    """Emergency reset with nuclear cleanup."""
    logger.warning("🚨 NUCLEAR SYSTEM RESET")
    
    clear_active_jobs()
    force_memory_cleanup()
    
    # Reset all limits
    global MAX_IMAGE_DIMENSION, MAX_DETECTION_PIXELS
    MAX_IMAGE_DIMENSION = 1024  # Even smaller
    MAX_DETECTION_PIXELS = 10000  # Ultra-tiny
    
    logger.warning("🚨 System reset with extreme limits")

def set_extreme_limits(max_dimension: int = 1024, max_detection: int = 10000):
    """Set extreme memory limits for critical situations."""
    global MAX_IMAGE_DIMENSION, MAX_DETECTION_PIXELS
    
    MAX_IMAGE_DIMENSION = max_dimension
    MAX_DETECTION_PIXELS = max_detection
    
    logger.warning(f"⚠️ EXTREME LIMITS: dimension={max_dimension}, detection={max_detection}")

# Minimal debug function
def debug_memory_usage():
    """Quick memory usage debug."""
    try:
        import psutil
        process = psutil.Process()
        memory_mb = process.memory_info().rss / 1024 / 1024
        logger.info(f"📊 Memory usage: {memory_mb:.1f} MB")
    except:
        logger.info("📊 Memory debugging not available")