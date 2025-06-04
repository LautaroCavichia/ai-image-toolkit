"""
Image processing module for image enlargement with generative fill.
Handles aspect ratio conversion and intelligent content generation to expand images.
"""

import logging
import os
import cv2
import numpy as np
from typing import Dict, Tuple, Any, Literal
import urllib.request
from pathlib import Path
from PIL import Image, ImageFilter, ImageOps
import requests

from app.cloudinary_service import CloudinaryService
from app.config import MODELS_DIR

logger = logging.getLogger(__name__)

class ImageProcessingError(Exception):
    """Custom exception for image processing errors."""
    pass

# Type definitions for better type safety
AspectRatio = Literal["portrait", "landscape", "square"]
PositionPortrait = Literal["center", "up", "down"]
PositionLandscape = Literal["center", "left", "right"]
PositionSquare = Literal["center", "top-left", "top-right", "bottom-left", "bottom-right"]

class ImageEnlarger:
    """
    Advanced image enlargement processor with generative fill capabilities.
    """
    
    def __init__(self):
        """Initialize the image enlarger with necessary models and configurations."""
        self.inpaint_models = {}
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize inpainting models for generative fill."""
        try:
            logger.info(f"Initializing enlarge models in directory: {MODELS_DIR}")
            
            # For now, we'll use OpenCV's inpainting methods
            # In production, you might want to integrate with more advanced models
            # like Stable Diffusion inpainting or similar
            logger.info("Using OpenCV-based content-aware fill")
            
        except Exception as e:
            logger.error(f"Failed to initialize models: {e}")
            raise RuntimeError(f"Model initialization failed: {e}")
    
    def calculate_target_dimensions(self, 
                                  original_width: int, 
                                  original_height: int, 
                                  target_aspect: AspectRatio) -> Tuple[int, int]:
        """
        Calculate target dimensions based on desired aspect ratio.
        Maintains the original image area while changing aspect ratio.
        """
        original_area = original_width * original_height
        
        if target_aspect == "square":
            # For square, use the diagonal as reference
            target_size = int(np.sqrt(original_area))
            return target_size, target_size
        elif target_aspect == "portrait":
            # 3:4 aspect ratio (portrait)
            ratio = 3 / 4
            target_width = int(np.sqrt(original_area * ratio))
            target_height = int(target_width / ratio)
            return target_width, target_height
        elif target_aspect == "landscape":
            # 4:3 aspect ratio (landscape)
            ratio = 4 / 3
            target_width = int(np.sqrt(original_area * ratio))
            target_height = int(target_width / ratio)
            return target_width, target_height
        else:
            raise ValueError(f"Unsupported aspect ratio: {target_aspect}")
    
    def calculate_positioning(self, 
                            original_width: int, 
                            original_height: int,
                            target_width: int, 
                            target_height: int,
                            aspect_ratio: AspectRatio,
                            position: str) -> Tuple[int, int]:
        """
        Calculate where to place the original image in the new canvas.
        Returns (x_offset, y_offset) for the top-left corner of the original image.
        """
        if aspect_ratio == "portrait":
            if position == "center":
                x_offset = (target_width - original_width) // 2
                y_offset = (target_height - original_height) // 2
            elif position == "up":
                x_offset = (target_width - original_width) // 2
                y_offset = 0
            elif position == "down":
                x_offset = (target_width - original_width) // 2
                y_offset = target_height - original_height
            else:
                raise ValueError(f"Invalid position for portrait: {position}")
                
        elif aspect_ratio == "landscape":
            if position == "center":
                x_offset = (target_width - original_width) // 2
                y_offset = (target_height - original_height) // 2
            elif position == "left":
                x_offset = 0
                y_offset = (target_height - original_height) // 2
            elif position == "right":
                x_offset = target_width - original_width
                y_offset = (target_height - original_height) // 2
            else:
                raise ValueError(f"Invalid position for landscape: {position}")
                
        elif aspect_ratio == "square":
            if position == "center":
                x_offset = (target_width - original_width) // 2
                y_offset = (target_height - original_height) // 2
            elif position == "top-left":
                x_offset = 0
                y_offset = 0
            elif position == "top-right":
                x_offset = target_width - original_width
                y_offset = 0
            elif position == "bottom-left":
                x_offset = 0
                y_offset = target_height - original_height
            elif position == "bottom-right":
                x_offset = target_width - original_width
                y_offset = target_height - original_height
            else:
                raise ValueError(f"Invalid position for square: {position}")
        else:
            raise ValueError(f"Unsupported aspect ratio: {aspect_ratio}")
        
        return max(0, x_offset), max(0, y_offset)
    
    def create_edge_aware_mask(self, image: np.ndarray, original_rect: Tuple[int, int, int, int]) -> np.ndarray:
        """
        Create a mask for inpainting that considers edge information.
        Returns a mask where 255 = areas to inpaint, 0 = areas to preserve.
        """
        height, width = image.shape[:2]
        mask = np.zeros((height, width), dtype=np.uint8)
        
        x, y, w, h = original_rect
        
        # Mark areas outside the original image as needing inpainting
        mask[:, :] = 255  # Start with everything needing inpainting
        mask[y:y+h, x:x+w] = 0  # Preserve the original image area
        
        # Create a gradient mask at the edges for smoother blending
        edge_width = min(20, min(w, h) // 10)  # Adaptive edge width
        
        # Apply gradient on the edges of the original image
        for i in range(edge_width):
            alpha = i / edge_width
            mask_value = int(255 * alpha)
            
            # Top edge
            if y > i:
                mask[y-i-1, max(0, x-i):min(width, x+w+i)] = mask_value
            
            # Bottom edge
            if y + h + i < height:
                mask[y+h+i, max(0, x-i):min(width, x+w+i)] = mask_value
            
            # Left edge
            if x > i:
                mask[max(0, y-i):min(height, y+h+i), x-i-1] = mask_value
            
            # Right edge
            if x + w + i < width:
                mask[max(0, y-i):min(height, y+h+i), x+w+i] = mask_value
        
        return mask
    
    def perform_content_aware_fill(self, image: np.ndarray, mask: np.ndarray) -> np.ndarray:
        """
        Perform content-aware fill using advanced inpainting techniques.
        """
        try:
            # Use OpenCV's Fast Marching Method for inpainting
            # This creates smooth, content-aware fill
            result = cv2.inpaint(image, mask, 3, cv2.INPAINT_TELEA)
            
            # Apply additional smoothing to make the fill more natural
            kernel = np.ones((3, 3), np.float32) / 9
            result = cv2.filter2D(result, -1, kernel)
            
            # Enhance the inpainted areas slightly
            inpaint_areas = mask > 0
            if np.any(inpaint_areas):
                # Slightly increase contrast in inpainted areas for better visual appeal
                result[inpaint_areas] = np.clip(result[inpaint_areas] * 1.05, 0, 255)
            
            return result
            
        except Exception as e:
            logger.error(f"Content-aware fill failed: {e}")
            # Fallback: simple edge extension
            return self._fallback_edge_extension(image, mask)
    
    def _fallback_edge_extension(self, image: np.ndarray, mask: np.ndarray) -> np.ndarray:
        """
        Fallback method using edge extension when advanced inpainting fails.
        """
        result = image.copy()
        height, width = image.shape[:2]
        
        # Find the boundaries of the original image
        non_mask = mask == 0
        if not np.any(non_mask):
            return result
        
        # Get the bounding box of the non-masked area
        y_indices, x_indices = np.where(non_mask)
        min_y, max_y = np.min(y_indices), np.max(y_indices)
        min_x, max_x = np.min(x_indices), np.max(x_indices)
        
        # Extend edges outward
        # Extend top
        if min_y > 0:
            for y in range(min_y):
                result[y, min_x:max_x+1] = result[min_y, min_x:max_x+1]
        
        # Extend bottom
        if max_y < height - 1:
            for y in range(max_y + 1, height):
                result[y, min_x:max_x+1] = result[max_y, min_x:max_x+1]
        
        # Extend left
        if min_x > 0:
            for x in range(min_x):
                result[:, x] = result[:, min_x]
        
        # Extend right
        if max_x < width - 1:
            for x in range(max_x + 1, width):
                result[:, x] = result[:, max_x]
        
        return result
    
    def process_enlargement(self, 
                          input_image: np.ndarray, 
                          target_aspect: AspectRatio,
                          position: str) -> np.ndarray:
        """
        Main processing function for image enlargement.
        """
        original_height, original_width = input_image.shape[:2]
        
        # Calculate target dimensions
        target_width, target_height = self.calculate_target_dimensions(
            original_width, original_height, target_aspect
        )
        
        logger.info(f"Enlarging from {original_width}x{original_height} to {target_width}x{target_height}")
        
        # Create new canvas
        if len(input_image.shape) == 3:
            new_canvas = np.zeros((target_height, target_width, input_image.shape[2]), dtype=np.uint8)
        else:
            new_canvas = np.zeros((target_height, target_width), dtype=np.uint8)
        
        # Calculate positioning
        x_offset, y_offset = self.calculate_positioning(
            original_width, original_height,
            target_width, target_height,
            target_aspect, position
        )
        
        # Place original image on new canvas
        end_y = min(y_offset + original_height, target_height)
        end_x = min(x_offset + original_width, target_width)
        actual_h = end_y - y_offset
        actual_w = end_x - x_offset
        
        new_canvas[y_offset:end_y, x_offset:end_x] = input_image[:actual_h, :actual_w]
        
        # Create mask for content-aware fill
        mask = self.create_edge_aware_mask(new_canvas, (x_offset, y_offset, actual_w, actual_h))
        
        # Perform content-aware fill
        result = self.perform_content_aware_fill(new_canvas, mask)
        
        logger.info(f"Successfully enlarged image with {target_aspect} aspect ratio, positioned at {position}")
        
        return result

async def perform_image_enlargement(
    job_id: str,
    image_url: str,
    config: Dict[str, Any]
) -> Tuple[str, Dict[str, Any]]:
    """
    Perform image enlargement with generative fill.
    
    Args:
        job_id: Unique job identifier
        image_url: Cloudinary URL of the original image
        config: Processing configuration with aspect ratio and positioning
        
    Returns:
        Tuple of (processed_image_url, processing_info)
    """
    logger.info(f"Processing enlargement job {job_id} with image URL: {image_url}")
    
    try:
        # Extract configuration
        aspect_ratio = config.get('aspectRatio', 'square')
        position = config.get('position', 'center')
        quality = config.get('quality', 'FREE').upper()
        is_premium = quality == 'PREMIUM'
        
        # Validate configuration
        valid_aspects = ['portrait', 'landscape', 'square']
        if aspect_ratio not in valid_aspects:
            raise ValueError(f"Invalid aspect ratio: {aspect_ratio}. Must be one of {valid_aspects}")
        
        # Download image from Cloudinary
        logger.info(f"Downloading image from Cloudinary: {image_url}")
        input_image_bytes = CloudinaryService.download_image_from_url(image_url)
        
        # Convert bytes to OpenCV image
        nparr = np.frombuffer(input_image_bytes, np.uint8)
        input_image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if input_image is None:
            raise ValueError("Failed to decode input image")
        
        # Initialize processor
        logger.info("Initializing ImageEnlarger...")
        enlarger = ImageEnlarger()
        
        logger.info(f"Performing {quality.lower()} quality enlargement for job {job_id}")
        logger.info(f"Target aspect ratio: {aspect_ratio}, Position: {position}")
        
        # Perform enlargement
        try:
            output_image = enlarger.process_enlargement(input_image, aspect_ratio, position)
        except Exception as e:
            logger.error(f"Enlargement processing failed: {e}")
            raise RuntimeError(f"Enlargement process failed: {e}")
        
        # Convert result back to bytes
        is_success, buffer = cv2.imencode('.png', output_image)
        if not is_success:
            raise RuntimeError("Failed to encode output image")
        
        output_bytes = buffer.tobytes()
        
        # Create thumbnail
        height, width = output_image.shape[:2]
        if is_premium:
            thumb_scale = min(800/width, 600/height, 1.0)
        else:
            thumb_scale = min(600/width, 450/height, 1.0)
        
        if thumb_scale < 1.0:
            new_width = int(width * thumb_scale)
            new_height = int(height * thumb_scale)
            thumbnail_image = cv2.resize(output_image, (new_width, new_height), interpolation=cv2.INTER_AREA)
        else:
            thumbnail_image = output_image.copy()
        
        # Encode thumbnail with lower quality
        encode_params = [cv2.IMWRITE_PNG_COMPRESSION, 7]
        is_success, thumb_buffer = cv2.imencode('.png', thumbnail_image, encode_params)
        if not is_success:
            raise RuntimeError("Failed to encode thumbnail image")
        
        thumbnail_bytes = thumb_buffer.tobytes()
        
        # Upload full-quality result to Cloudinary
        processed_url, processed_public_id = CloudinaryService.upload_processed_image(
            output_bytes, job_id, "enlarged"
        )
        
        # Upload thumbnail to Cloudinary  
        thumbnail_url, thumbnail_public_id = CloudinaryService.upload_thumbnail(
            thumbnail_bytes, job_id
        )

        logger.info(f"Successfully processed enlargement job {job_id}")
        logger.info(f"Full quality URL: {processed_url}")
        logger.info(f"Thumbnail URL: {thumbnail_url}")

        # Calculate dimensions
        original_height, original_width = input_image.shape[:2]
        output_height, output_width = output_image.shape[:2]

        processing_info = {
            "processing_type": "image_enlargement",
            "aspect_ratio": aspect_ratio,
            "position": position,
            "quality_level": quality.lower(),
            "original_size": f"{original_width}x{original_height}",
            "output_size": f"{output_width}x{output_height}",
            "area_increase_factor": round((output_width * output_height) / (original_width * original_height), 2),
            "processing_time_seconds": 0,
            "full_quality_public_id": processed_public_id,
            "thumbnail_public_id": thumbnail_public_id,
            "thumbnail_url": thumbnail_url,
            "is_premium": is_premium
        }

        return processed_url, processing_info

    except Exception as e:
        logger.error(f"Enlargement failed for job {job_id}: {e}")
        raise ImageProcessingError(f"Enlargement failed: {e}")