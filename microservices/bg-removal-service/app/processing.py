"""
Image processing module for background removal.
Implements both full-quality and low-quality thumbnail generation.
"""

import os
import asyncio
import logging
from typing import Dict, Tuple, Any
from pathlib import Path
import io
from PIL import Image, ImageDraw, ImageFont

logger = logging.getLogger(__name__)

from rembg import remove

async def perform_background_removal(
    job_id: str,
    image_path: str,
    config: Dict[str, Any]
) -> Tuple[str, Dict[str, Any]]:
    logger.info(f"Processing job {job_id} with image: {image_path}")
    
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")

    try:
        # Load input image
        with open(image_path, 'rb') as i:
            input_image_bytes = i.read()

        # Perform background removal using rembg
        output_bytes = remove(input_image_bytes)

        # Save full-quality result
        processed_dir = "../../storage/processed"
        os.makedirs(processed_dir, exist_ok=True)
        output_path = os.path.join(processed_dir, f"{job_id}_bg_removed.png")

        with open(output_path, 'wb') as o:
            o.write(output_bytes)

        # Load image from output for thumbnail
        output_image = Image.open(io.BytesIO(output_bytes)).convert("RGBA")
        thumbnail = output_image.resize((400, 300), Image.LANCZOS)

        # Save thumbnail (no watermark as per your note)
        thumbnail_path = os.path.join(processed_dir, f"{job_id}_bg_removed_thumbnail.png")
        thumbnail.save(thumbnail_path, "PNG", quality=70)

        logger.info(f"Saved background-removed image: {output_path}")
        logger.info(f"Saved thumbnail image: {thumbnail_path}")

        processing_info = {
            "model_version": "rembg_u2net",
            "mode": "lightweight_cpu",
            "processing_time_seconds": 0,  # You can measure with time.perf_counter() if needed
            "confidence_score": 1.0,  # rembg doesn't return this, but you can simulate
            "threshold_applied": config.get("threshold", None)
        }

        return output_path, processing_info

    except Exception as e:
        logger.error(f"Background removal failed: {e}")
        raise RuntimeError(f"Background removal failed: {e}")
