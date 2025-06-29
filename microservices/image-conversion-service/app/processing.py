"""
Image processing module for format conversion and compression with Cloudinary integration.
Supports major image formats: JPEG, PNG, WebP, TIFF, BMP, GIF, HEIC/HEIF with proper compatibility handling.
Implements compression and quality optimization for web usage.
"""

import logging
import time
import traceback
import io
import threading
from typing import Dict, Tuple, Any, Set, Optional
from PIL import Image
from PIL.ExifTags import TAGS

try:
    from pillow_heif import register_heif_opener
    register_heif_opener()
    HEIF_SUPPORTED = True
except ImportError:
    HEIF_SUPPORTED = False

from app.cloudinary_service import CloudinaryService
from app.local_image_processing import LocalImageProcessor

logger = logging.getLogger(__name__)

class ImageProcessingError(Exception):
    """Error specific to image processing failures."""

# Threading locks and job tracking
_active_jobs: Set[str] = set()
_jobs_lock = threading.Lock()

# Supported formats mapping
SUPPORTED_FORMATS = {
    'JPEG': {'extensions': ['.jpg', '.jpeg'], 'mime': 'image/jpeg', 'pil_format': 'JPEG'},
    'PNG': {'extensions': ['.png'], 'mime': 'image/png', 'pil_format': 'PNG'},
    'WebP': {'extensions': ['.webp'], 'mime': 'image/webp', 'pil_format': 'WebP'},
    'TIFF': {'extensions': ['.tiff', '.tif'], 'mime': 'image/tiff', 'pil_format': 'TIFF'},
    'BMP': {'extensions': ['.bmp'], 'mime': 'image/bmp', 'pil_format': 'BMP'},
    'GIF': {'extensions': ['.gif'], 'mime': 'image/gif', 'pil_format': 'GIF'},
}

if HEIF_SUPPORTED:
    SUPPORTED_FORMATS['HEIC'] = {'extensions': ['.heic', '.heif'], 'mime': 'image/heif', 'pil_format': 'HEIF'}

def get_active_jobs_count() -> int:
    """Returns the number of jobs currently being processed."""
    with _jobs_lock:
        return len(_active_jobs)

def clear_active_jobs():
    """Clears the set of active jobs."""
    global _active_jobs
    with _jobs_lock:
        logger.info("🧹 Clearing active jobs list")
        _active_jobs.clear()

def detect_image_format(image_bytes: bytes) -> Optional[str]:
    """
    Detect the format of an image from its bytes.
    
    Args:
        image_bytes: Raw image data
        
    Returns:
        Format name (JPEG, PNG, etc.) or None if unrecognized
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))
        format_name = image.format
        
        # Map PIL format names to our standard format names
        format_mapping = {
            'JPEG': 'JPEG',
            'PNG': 'PNG',
            'WEBP': 'WebP',
            'TIFF': 'TIFF',
            'BMP': 'BMP',
            'GIF': 'GIF',
        }
        
        if HEIF_SUPPORTED and format_name in ['HEIF', 'HEIC']:
            return 'HEIC'
            
        return format_mapping.get(format_name, format_name)
        
    except Exception as e:
        logger.warning(f"Could not detect image format: {e}")
        return None

def preserve_exif_data(original_image: Image.Image, converted_image: Image.Image) -> Image.Image:
    """
    Preserve EXIF data from original image to converted image when possible.
    
    Args:
        original_image: Source image with EXIF data
        converted_image: Target image to receive EXIF data
        
    Returns:
        Image with preserved EXIF data
    """
    try:
        if hasattr(original_image, '_getexif') and original_image._getexif() is not None:
            exif_dict = original_image._getexif()
            if exif_dict:
                # Convert to proper EXIF format
                exif_ifd = {}
                for tag_id, value in exif_dict.items():
                    tag = TAGS.get(tag_id, tag_id)
                    exif_ifd[tag] = value
                
                # Apply to converted image if format supports EXIF
                if converted_image.format in ['JPEG', 'TIFF']:
                    converted_image.save(io.BytesIO(), format=converted_image.format, exif=original_image.info.get('exif'))
                    
        return converted_image
        
    except Exception as e:
        logger.warning(f"Could not preserve EXIF data: {e}")
        return converted_image

def apply_compression(image: Image.Image, target_format: str, quality: int = 85, optimize: bool = True) -> bytes:
    """
    Apply compression to image based on target format and quality settings.
    
    Args:
        image: PIL Image object
        target_format: Target format (JPEG, PNG, WebP, etc.)
        quality: Quality level (1-100, only for lossy formats)
        optimize: Whether to optimize the image
        
    Returns:
        Compressed image as bytes
    """
    output_buffer = io.BytesIO()
    
    # Format-specific compression settings
    save_kwargs = {'format': target_format, 'optimize': optimize}
    
    if target_format == 'JPEG':
        # JPEG compression
        save_kwargs.update({
            'quality': quality,
            'progressive': True,
            'subsampling': 0 if quality > 85 else 2
        })
        
        # Convert to RGB if necessary (JPEG doesn't support transparency)
        if image.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            if image.mode in ('RGBA', 'LA'):
                background.paste(image, mask=image.split()[-1])
            image = background
            
    elif target_format == 'PNG':
        # PNG compression (lossless but can optimize)
        save_kwargs.update({
            'compress_level': 6 if optimize else 1,
            'pnginfo': None  # Remove metadata to reduce size
        })
        
    elif target_format == 'WebP':
        # WebP compression (supports both lossy and lossless)
        if quality >= 100:
            save_kwargs.update({'lossless': True})
        else:
            save_kwargs.update({
                'quality': quality,
                'method': 6  # Better compression
            })
            
    elif target_format == 'TIFF':
        # TIFF compression
        save_kwargs.update({
            'compression': 'tiff_lzw',  # Lossless compression
            'tiffinfo': {}
        })
        
    elif target_format == 'BMP':
        # BMP has no compression options
        pass
        
    elif target_format == 'GIF':
        # GIF specific handling
        if image.mode != 'P':
            image = image.convert('P', palette=Image.ADAPTIVE, colors=256)
        save_kwargs.update({'save_all': True})
    
    try:
        image.save(output_buffer, **save_kwargs)
        return output_buffer.getvalue()
        
    except Exception as e:
        logger.error(f"Compression failed for format {target_format}: {e}")
        # Fallback: save with minimal options
        fallback_buffer = io.BytesIO()
        image.save(fallback_buffer, format=target_format)
        return fallback_buffer.getvalue()

def convert_image_format(
    image_bytes: bytes,
    target_format: str,
    quality: int = 85,
    preserve_exif: bool = True,
    resize_dimensions: Optional[Tuple[int, int]] = None,
    maintain_aspect_ratio: bool = True
) -> Tuple[bytes, Dict[str, Any]]:
    """
    Convert image to target format with optional compression and resizing.
    
    Args:
        image_bytes: Source image bytes
        target_format: Target format (JPEG, PNG, WebP, etc.)
        quality: Quality level for compression (1-100)
        preserve_exif: Whether to preserve EXIF data
        resize_dimensions: Optional (width, height) for resizing
        maintain_aspect_ratio: Whether to maintain aspect ratio when resizing
        
    Returns:
        Tuple of (converted_image_bytes, processing_info)
    """
    start_time = time.perf_counter()
    
    try:
        # Load and analyze original image
        original_image = Image.open(io.BytesIO(image_bytes))
        original_format = original_image.format
        original_mode = original_image.mode
        original_size = original_image.size
        
        logger.info(f"Converting {original_format} ({original_mode}) {original_size} to {target_format}")
        
        # Work with a copy
        converted_image = original_image.copy()
        
        # Handle resizing if requested
        if resize_dimensions:
            new_width, new_height = resize_dimensions
            
            if maintain_aspect_ratio:
                # Calculate dimensions maintaining aspect ratio
                aspect_ratio = original_size[0] / original_size[1]
                
                if new_width / new_height > aspect_ratio:
                    # Height is the limiting factor
                    new_width = int(new_height * aspect_ratio)
                else:
                    # Width is the limiting factor
                    new_height = int(new_width / aspect_ratio)
            
            # Use high-quality resampling
            converted_image = converted_image.resize(
                (new_width, new_height), 
                Image.Resampling.LANCZOS
            )
            logger.info(f"Resized to {new_width}x{new_height}")
        
        # Preserve EXIF data if requested and supported
        if preserve_exif and target_format in ['JPEG', 'TIFF']:
            converted_image = preserve_exif_data(original_image, converted_image)
        
        # Apply format-specific compression
        compressed_bytes = apply_compression(converted_image, target_format, quality, optimize=True)
        
        processing_time = time.perf_counter() - start_time
        
        # Calculate compression ratio
        original_size_bytes = len(image_bytes)
        compressed_size_bytes = len(compressed_bytes)
        compression_ratio = (1 - compressed_size_bytes / original_size_bytes) * 100 if original_size_bytes > 0 else 0
        
        processing_info = {
            'original_format': original_format,
            'target_format': target_format,
            'original_size': original_size,
            'final_size': converted_image.size,
            'original_mode': original_mode,
            'final_mode': converted_image.mode,
            'original_size_bytes': original_size_bytes,
            'compressed_size_bytes': compressed_size_bytes,
            'compression_ratio_percent': round(compression_ratio, 2),
            'quality_setting': quality,
            'processing_time_seconds': round(processing_time, 3),
            'exif_preserved': preserve_exif and target_format in ['JPEG', 'TIFF'],
            'resized': resize_dimensions is not None
        }
        
        logger.info(f"Conversion completed: {compression_ratio:.1f}% size reduction")
        
        return compressed_bytes, processing_info
        
    except Exception as e:
        logger.error(f"Image conversion failed: {e}")
        logger.error(traceback.format_exc())
        raise ImageProcessingError(f"Failed to convert image: {e}")

async def perform_image_conversion(
    job_id: str,
    image_url: str,
    config: Dict[str, Any]
) -> Tuple[str, Dict[str, Any]]:
    """
    Main function to perform image conversion with Cloudinary integration.
    
    Args:
        job_id: Unique job identifier
        image_url: Source image URL from Cloudinary
        config: Conversion configuration
        
    Returns:
        Tuple of (processed_image_url, processing_params)
    """
    logger.info(f"🚀 Starting image conversion job {job_id}")
    logger.info(f"🔗 Source URL: {image_url}")
    logger.info(f"⚙️ Config: {config}")
    
    # Track active jobs to prevent duplicates
    with _jobs_lock:
        if job_id in _active_jobs:
            error_msg = f"🚫 Job {job_id} already being processed, ignoring duplicate"
            logger.warning(error_msg)
            raise ImageProcessingError(error_msg)
        
        _active_jobs.add(job_id)
        logger.info(f"📝 Job {job_id} added to active list. Total active jobs: {len(_active_jobs)}")

    try:
        # Extract configuration parameters
        target_format = config.get('target_format', 'JPEG').upper()
        quality = config.get('quality', 85)
        preserve_exif = config.get('preserve_exif', True)
        resize_width = config.get('resize_width')
        resize_height = config.get('resize_height')
        maintain_aspect_ratio = config.get('maintain_aspect_ratio', True)
        
        # Validate target format
        if target_format not in SUPPORTED_FORMATS:
            raise ImageProcessingError(f"Unsupported target format: {target_format}")
        
        # Validate quality parameter
        if not (1 <= quality <= 100):
            quality = 85
            logger.warning(f"Invalid quality {config.get('quality')}, using default: {quality}")
        
        # Prepare resize dimensions if specified
        resize_dimensions = None
        if resize_width or resize_height:
            # If only one dimension is specified, the other will be calculated maintaining aspect ratio
            resize_dimensions = (
                resize_width or 0,  # Will be calculated if 0
                resize_height or 0  # Will be calculated if 0
            )
        
        logger.info(f"⬇️ Downloading image from: {image_url}")
        input_image_bytes = CloudinaryService.download_image_from_url(image_url)
        
        # Detect original format
        original_format = detect_image_format(input_image_bytes)
        logger.info(f"📋 Detected original format: {original_format}")
        
        # Perform conversion
        logger.info(f"🔄 Converting to {target_format} with quality {quality}")
        converted_bytes, processing_info = convert_image_format(
            input_image_bytes,
            target_format,
            quality=quality,
            preserve_exif=preserve_exif,
            resize_dimensions=resize_dimensions,
            maintain_aspect_ratio=maintain_aspect_ratio
        )
        
        # Generate thumbnail for preview
        logger.info(f"🖼️ Generating thumbnail for {job_id}")
        thumbnail_image = Image.open(io.BytesIO(converted_bytes)).convert("RGB")
        thumbnail_image.thumbnail((400, 300), Image.Resampling.LANCZOS)
        
        thumbnail_buffer = io.BytesIO()
        thumbnail_image.save(thumbnail_buffer, format="JPEG", optimize=True, quality=70)
        thumbnail_bytes = thumbnail_buffer.getvalue()
        
        logger.info(f"🖼️ Generating thumbnail locally for {job_id}")
        # Create thumbnail locally for better quality control
        thumbnail_bytes = LocalImageProcessor.create_thumbnail(converted_bytes)
        
        # Optimize premium image
        optimized_premium_bytes = LocalImageProcessor.optimize_premium_image(converted_bytes)
        
        logger.info(f"☁️ Uploading premium optimized image to Cloudinary for {job_id}")
        processed_url, processed_public_id = CloudinaryService.upload_processed_image(
            optimized_premium_bytes, job_id, f"converted_{target_format.lower()}"
        )
        
        logger.info(f"☁️ Uploading thumbnail to Cloudinary for {job_id}")
        thumbnail_url, thumbnail_public_id = CloudinaryService.upload_thumbnail(
            thumbnail_bytes, job_id
        )
        
        # Prepare final processing information
        final_processing_info = {
            **processing_info,
            'service_type': 'image_conversion',
            'full_quality_public_id': processed_public_id,
            'thumbnail_public_id': thumbnail_public_id,
            'thumbnail_url': thumbnail_url,
            'local_thumbnail_generated': True,
            'thumbnail_size_bytes': len(thumbnail_bytes),
            'premium_size_bytes': len(optimized_premium_bytes),
            'mode': 'hybrid_secure_integration',
            'job_id': job_id,
            'timestamp': time.time(),
            'conversion_successful': True
        }
        
        logger.info(f"✅ Image conversion job {job_id} completed successfully")
        logger.info(f"🔗 Premium quality URL: {processed_url}")
        logger.info(f"🔗 Thumbnail URL: {thumbnail_url}")
        logger.info(f"📊 Size reduction: {processing_info['compression_ratio_percent']}%")
        
        return processed_url, final_processing_info
        
    except Exception as e:
        logger.error(f"❌ Error in image conversion job {job_id}: {e}")
        logger.error(f"📋 Full traceback: {traceback.format_exc()}")
        raise ImageProcessingError(f"Image conversion failed for job {job_id}: {e}")
    
    finally:
        # Always remove job from active set
        with _jobs_lock:
            _active_jobs.discard(job_id)
            logger.info(f"🗑️ Job {job_id} removed from active list. Remaining jobs: {len(_active_jobs)}")

def get_system_status() -> Dict[str, Any]:
    """
    Returns current system status for monitoring and debugging.
    """
    with _jobs_lock:
        return {
            'service_type': 'image_conversion',
            'active_jobs_count': len(_active_jobs),
            'active_jobs': list(_active_jobs),
            'supported_formats': list(SUPPORTED_FORMATS.keys()),
            'heif_support': HEIF_SUPPORTED,
            'timestamp': time.time()
        }

def get_supported_formats() -> Dict[str, Any]:
    """
    Returns information about supported image formats.
    """
    return {
        'supported_formats': SUPPORTED_FORMATS,
        'heif_support': HEIF_SUPPORTED,
        'total_formats': len(SUPPORTED_FORMATS)
    }