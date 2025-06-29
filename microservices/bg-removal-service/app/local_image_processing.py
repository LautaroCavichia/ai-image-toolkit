"""
Local image processing utilities for creating thumbnails and optimizing images.
This replaces Cloudinary transformations with local processing to save costs.
"""

import io
import logging
from PIL import Image, ImageOps
from typing import Tuple, Optional

logger = logging.getLogger(__name__)

class LocalImageProcessor:
    """Handle local image processing operations"""
    
    # Thumbnail settings
    THUMBNAIL_SIZE = (400, 300)
    THUMBNAIL_QUALITY = 70
    THUMBNAIL_FORMAT = 'JPEG'
    
    # Premium quality settings
    PREMIUM_QUALITY = 95
    PREMIUM_FORMAT = 'PNG'
    
    @staticmethod
    def create_thumbnail(image_bytes: bytes) -> bytes:
        """
        Create a thumbnail version of the image locally.
        
        Args:
            image_bytes: Original image data
            
        Returns:
            Compressed thumbnail image bytes
        """
        try:
            # Open the image
            with Image.open(io.BytesIO(image_bytes)) as img:
                # Convert to RGB if necessary (for JPEG output)
                if img.mode in ('RGBA', 'LA', 'P'):
                    # Create white background for transparency
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    if img.mode == 'P':
                        img = img.convert('RGBA')
                    background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                    img = background
                elif img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Apply auto-orientation based on EXIF data
                img = ImageOps.exif_transpose(img)
                
                # Calculate thumbnail size maintaining aspect ratio
                img.thumbnail(LocalImageProcessor.THUMBNAIL_SIZE, Image.Resampling.LANCZOS)
                
                # Save as JPEG with compression
                output = io.BytesIO()
                img.save(
                    output, 
                    format=LocalImageProcessor.THUMBNAIL_FORMAT,
                    quality=LocalImageProcessor.THUMBNAIL_QUALITY,
                    optimize=True
                )
                
                thumbnail_bytes = output.getvalue()
                
                logger.info(f"Created thumbnail: {img.size[0]}x{img.size[1]} pixels, "
                          f"{len(thumbnail_bytes)} bytes (compression: "
                          f"{(1.0 - len(thumbnail_bytes) / len(image_bytes)) * 100:.1f}%)")
                
                return thumbnail_bytes
                
        except Exception as e:
            logger.error(f"Failed to create thumbnail: {e}")
            raise RuntimeError(f"Thumbnail creation failed: {e}")
    
    @staticmethod
    def optimize_premium_image(image_bytes: bytes) -> bytes:
        """
        Optimize premium image while maintaining high quality.
        
        Args:
            image_bytes: Original processed image data
            
        Returns:
            Optimized premium image bytes
        """
        try:
            with Image.open(io.BytesIO(image_bytes)) as img:
                # Apply auto-orientation based on EXIF data
                img = ImageOps.exif_transpose(img)
                
                # Save as high-quality PNG to preserve transparency and quality
                output = io.BytesIO()
                
                if img.mode in ('RGBA', 'LA'):
                    # Keep transparency for PNG
                    img.save(
                        output,
                        format=LocalImageProcessor.PREMIUM_FORMAT,
                        optimize=True
                    )
                else:
                    # Use high-quality JPEG for RGB images
                    if img.mode != 'RGB':
                        img = img.convert('RGB')
                    img.save(
                        output,
                        format='JPEG',
                        quality=LocalImageProcessor.PREMIUM_QUALITY,
                        optimize=True
                    )
                
                optimized_bytes = output.getvalue()
                
                logger.info(f"Optimized premium image: {img.size[0]}x{img.size[1]} pixels, "
                          f"{len(optimized_bytes)} bytes")
                
                return optimized_bytes
                
        except Exception as e:
            logger.error(f"Failed to optimize premium image: {e}")
            raise RuntimeError(f"Premium optimization failed: {e}")
    
    @staticmethod
    def get_image_info(image_bytes: bytes) -> dict:
        """
        Get image metadata without loading the full image.
        
        Args:
            image_bytes: Image data
            
        Returns:
            Dictionary with image information
        """
        try:
            with Image.open(io.BytesIO(image_bytes)) as img:
                return {
                    'width': img.width,
                    'height': img.height,
                    'format': img.format,
                    'mode': img.mode,
                    'size_bytes': len(image_bytes)
                }
        except Exception as e:
            logger.error(f"Failed to get image info: {e}")
            return {}