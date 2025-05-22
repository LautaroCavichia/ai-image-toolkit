"""
Cloudinary service for image upload and management.
"""

import logging
import cloudinary.uploader
import requests
from io import BytesIO
from typing import Tuple, Optional

logger = logging.getLogger(__name__)

class CloudinaryService:
    
    @staticmethod
    def download_image_from_url(image_url: str) -> bytes:
        """Download image from Cloudinary URL."""
        try:
            response = requests.get(image_url, timeout=30)
            response.raise_for_status()
            return response.content
        except Exception as e:
            logger.error(f"Failed to download image from {image_url}: {e}")
            raise RuntimeError(f"Failed to download image: {e}")
    
    @staticmethod
    def upload_processed_image(image_bytes: bytes, job_id: str, suffix: str = "upscaled") -> Tuple[str, str]:
        """
        Upload processed image to Cloudinary.
        
        Args:
            image_bytes: The processed image as bytes
            job_id: The job ID for naming
            suffix: Suffix for the filename
            
        Returns:
            Tuple of (cloudinary_url, public_id)
        """
        try:
            public_id = f"pixelperfect/processed/{job_id}_{suffix}"
            
            # Upload to Cloudinary
            upload_result = cloudinary.uploader.upload(
                image_bytes,
                public_id=public_id,
                overwrite=True,
                resource_type="image",
                tags=["processed", f"job_{job_id}", "upscaled"]
            )
            
            cloudinary_url = upload_result.get("secure_url")
            actual_public_id = upload_result.get("public_id")
            
            logger.info(f"Uploaded processed image to Cloudinary: {cloudinary_url}")
            
            return cloudinary_url, actual_public_id
            
        except Exception as e:
            logger.error(f"Failed to upload processed image to Cloudinary: {e}")
            raise RuntimeError(f"Failed to upload processed image: {e}")
    
    @staticmethod
    def upload_thumbnail(image_bytes: bytes, job_id: str) -> Tuple[str, str]:
        """
        Upload thumbnail version to Cloudinary.
        
        Args:
            image_bytes: The thumbnail image as bytes
            job_id: The job ID for naming
            
        Returns:
            Tuple of (cloudinary_url, public_id)
        """
        try:
            public_id = f"pixelperfect/thumbnails/{job_id}_upscaled_thumbnail"
            
            # Upload thumbnail to Cloudinary
            upload_result = cloudinary.uploader.upload(
                image_bytes,
                public_id=public_id,
                overwrite=True,
                resource_type="image",
                tags=["thumbnail", "free", f"job_{job_id}", "upscaled"],
                # Apply transformations for thumbnail
                transformation=[
                    {"width": 800, "height": 600, "crop": "fit"},
                    {"quality": "70"}
                ]
            )
            
            cloudinary_url = upload_result.get("secure_url")
            actual_public_id = upload_result.get("public_id")
            
            logger.info(f"Uploaded thumbnail to Cloudinary: {cloudinary_url}")
            
            return cloudinary_url, actual_public_id
            
        except Exception as e:
            logger.error(f"Failed to upload thumbnail to Cloudinary: {e}")
            raise RuntimeError(f"Failed to upload thumbnail: {e}")
    
    @staticmethod
    def delete_image(public_id: str) -> bool:
        """
        Delete image from Cloudinary.
        
        Args:
            public_id: The public ID of the image to delete
            
        Returns:
            True if successful, False otherwise
        """
        try:
            result = cloudinary.uploader.destroy(public_id)
            success = result.get("result") == "ok"
            if success:
                logger.info(f"Successfully deleted image: {public_id}")
            else:
                logger.warning(f"Failed to delete image: {public_id} - {result}")
            return success
        except Exception as e:
            logger.error(f"Error deleting image {public_id}: {e}")
            return False