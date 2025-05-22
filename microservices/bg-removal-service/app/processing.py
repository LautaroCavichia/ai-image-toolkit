"""
Image processing module for background removal with Cloudinary integration.
Implements both full-quality and low-quality thumbnail generation.
"""

import logging
from typing import Dict, Tuple, Any
import io
from PIL import Image
from rembg import remove

from app.cloudinary_service import CloudinaryService

logger = logging.getLogger(__name__)

async def perform_background_removal(
    job_id: str,
    image_url: str,  # Now receives Cloudinary URL instead of local path
    config: Dict[str, Any]
) -> Tuple[str, Dict[str, Any]]:
    """
    Perform background removal on image from Cloudinary URL.
    
    Args:
        job_id: Unique job identifier
        image_url: Cloudinary URL of the original image
        config: Processing configuration
        
    Returns:
        Tuple of (processed_image_url, processing_info)
    """
    logger.info(f"Processing job {job_id} with image URL: {image_url}")
    
    try:
        # Download image from Cloudinary
        logger.info(f"Downloading image from Cloudinary: {image_url}")
        input_image_bytes = CloudinaryService.download_image_from_url(image_url)
        
        # Perform background removal using rembg
        logger.info(f"Performing background removal for job {job_id}")
        output_bytes = remove(input_image_bytes)

        # Load image from output for thumbnail creation
        output_image = Image.open(io.BytesIO(output_bytes)).convert("RGBA")
        
        # Create thumbnail (low quality for free users)
        thumbnail = output_image.copy()
        thumbnail.thumbnail((400, 300), Image.Resampling.LANCZOS)
        
        # Convert thumbnail to bytes
        thumbnail_buffer = io.BytesIO()
        thumbnail.save(thumbnail_buffer, format="PNG", optimize=True, quality=70)
        thumbnail_bytes = thumbnail_buffer.getvalue()

        # Upload full-quality result to Cloudinary
        processed_url, processed_public_id = CloudinaryService.upload_processed_image(
            output_bytes, job_id, "bg_removed"
        )
        
        # Upload thumbnail to Cloudinary  
        thumbnail_url, thumbnail_public_id = CloudinaryService.upload_thumbnail(
            thumbnail_bytes, job_id
        )

        logger.info(f"Successfully processed job {job_id}")
        logger.info(f"Full quality URL: {processed_url}")
        logger.info(f"Thumbnail URL: {thumbnail_url}")

        processing_info = {
            "model_version": "rembg_u2net",
            "mode": "cloudinary_integration",
            "processing_time_seconds": 0,  # You can measure with time.perf_counter() if needed
            "confidence_score": 1.0,  # rembg doesn't return this, but you can simulate
            "threshold_applied": config.get("threshold", None),
            "full_quality_public_id": processed_public_id,
            "thumbnail_public_id": thumbnail_public_id,
            "thumbnail_url": thumbnail_url
        }

        # Return the full quality URL - the backend will handle access control
        return processed_url, processing_info

    except Exception as e:
        logger.error(f"Background removal failed for job {job_id}: {e}")
        raise RuntimeError(f"Background removal failed: {e}")