"""
Enhanced image processing module for image enlargement with generative fill.
Uses lightweight ONNX models for better quality content-aware fill.
"""

import logging
import os
import cv2
import numpy as np
from typing import Dict, Tuple, Any, Literal
import urllib.request
from pathlib import Path
from PIL import Image, ImageFilter, ImageOps, ImageEnhance
import requests
import onnxruntime as ort
from skimage import measure, morphology
from scipy import ndimage

from app.cloudinary_service import CloudinaryService
from app.config import MODELS_DIR

logger = logging.getLogger(__name__)

class ImageProcessingError(Exception):
    """Custom exception for image processing errors."""
    pass

# Type definitions
AspectRatio = Literal["portrait", "landscape", "square"]

class LightweightImageEnlarger:
    """
    Lightweight image enlargement processor using efficient algorithms
    and optional ONNX models for content generation.
    """
    
    def __init__(self):
        """Initialize the image enlarger."""
        self.session = None
        self.model_initialized = False
        self._try_initialize_model()
    
    def _try_initialize_model(self):
        """Try to initialize ONNX model if available, fallback to traditional methods."""
        try:
            model_path = os.path.join(MODELS_DIR, "lama_inpainting.onnx")
            
            # Try to download lightweight inpainting model if not exists
            if not os.path.exists(model_path):
                logger.info("Downloading lightweight inpainting model...")
                self._download_model(model_path)
            
            if os.path.exists(model_path):
                self.session = ort.InferenceSession(
                    model_path,
                    providers=['CPUExecutionProvider']  # CPU only for lightweight deployment
                )
                self.model_initialized = True
                logger.info("Successfully loaded ONNX inpainting model")
            else:
                logger.info("ONNX model not available, using traditional methods")
                
        except Exception as e:
            logger.warning(f"Failed to initialize ONNX model: {e}. Using fallback methods.")
            self.model_initialized = False
    def _download_model(self, model_path: str):
        """Download LaMa inpainting model from official sources."""
        try:
            # Create models directory if it doesn't exist
            os.makedirs(os.path.dirname(model_path), exist_ok=True)
            
            # LaMa model URLs (updated with working sources)
            model_urls = [
                # Primary URL - Hugging Face Carve/LaMa-ONNX (recommended version)
                "https://huggingface.co/Carve/LaMa-ONNX/resolve/main/lama_fp32.onnx",
                # Backup URL - Alternative version from same repo
                "https://huggingface.co/Carve/LaMa-ONNX/resolve/main/lama.onnx",
                # Alternative backup - smartywu/big-lama
                "https://huggingface.co/smartywu/big-lama/resolve/main/pytorch_model.bin",
                # Google Drive backup (if available)
                "https://drive.google.com/uc?id=1zWoUvTaJGdd0_PP1dUWHBGjNGr8XuCjQ&export=download"
            ]
            
            for i, url in enumerate(model_urls):
                try:
                    logger.info(f"Attempting to download LaMa model from URL {i+1}/{len(model_urls)}")
                    logger.info(f"Source: {url}")
                    
                    # Create a temporary file first
                    temp_path = model_path + ".tmp"
                    
                    # Set appropriate headers for different sources
                    headers = {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                    
                    # Download with progress tracking
                    response = requests.get(url, stream=True, timeout=300, headers=headers)
                    response.raise_for_status()
                    
                    total_size = int(response.headers.get('content-length', 0))
                    downloaded_size = 0
                    
                    logger.info(f"Starting download... Expected size: {total_size / (1024*1024):.1f} MB" if total_size > 0 else "Starting download...")
                    
                    with open(temp_path, 'wb') as f:
                        for chunk in response.iter_content(chunk_size=8192):
                            if chunk:
                                f.write(chunk)
                                downloaded_size += len(chunk)
                                
                                # Log progress every 10MB
                                if downloaded_size % (10 * 1024 * 1024) == 0 and total_size > 0:
                                    progress = (downloaded_size / total_size) * 100
                                    logger.info(f"Download progress: {progress:.1f}%")
                    
                    # Verify the downloaded file
                    if os.path.exists(temp_path) and os.path.getsize(temp_path) > 1024 * 1024:  # At least 1MB
                        # Try to load the model to verify it's valid (only for ONNX files)
                        if temp_path.endswith('.onnx') or model_path.endswith('.onnx'):
                            try:
                                test_session = ort.InferenceSession(
                                    temp_path,
                                    providers=['CPUExecutionProvider']
                                )
                                
                                # If we can create a session, move temp file to final location
                                os.rename(temp_path, model_path)
                                logger.info(f"Successfully downloaded and verified LaMa ONNX model ({os.path.getsize(model_path) / (1024*1024):.1f} MB)")
                                return
                                
                            except Exception as e:
                                logger.warning(f"Downloaded ONNX model failed verification: {e}")
                                if os.path.exists(temp_path):
                                    os.remove(temp_path)
                                continue
                        else:
                            # For non-ONNX files (like .bin), just check if file exists and has reasonable size
                            os.rename(temp_path, model_path)
                            logger.info(f"Successfully downloaded LaMa model ({os.path.getsize(model_path) / (1024*1024):.1f} MB)")
                            return
                    else:
                        logger.warning(f"Downloaded file is too small or doesn't exist")
                        if os.path.exists(temp_path):
                            os.remove(temp_path)
                        continue
                        
                except requests.exceptions.RequestException as e:
                    logger.warning(f"Failed to download from {url}: {e}")
                    continue
                except Exception as e:
                    logger.warning(f"Error downloading model from {url}: {e}")
                    continue
            
            # If all URLs failed, log warning but don't raise exception
            logger.warning("Failed to download LaMa model from all sources. Using traditional inpainting methods.")
            
        except Exception as e:
            logger.error(f"Model download process failed: {e}")
    
    def calculate_target_dimensions(self, 
                                  original_width: int, 
                                  original_height: int, 
                                  target_aspect: AspectRatio) -> Tuple[int, int]:
        """Calculate target dimensions maintaining reasonable output size."""
        original_area = original_width * original_height
        
        # Limit maximum output size to prevent memory issues
        max_area = 2048 * 2048  # 4MP max
        if original_area > max_area:
            scale_factor = np.sqrt(max_area / original_area)
            original_width = int(original_width * scale_factor)
            original_height = int(original_height * scale_factor)
            original_area = original_width * original_height
        
        if target_aspect == "square":
            # Use geometric mean for better proportion
            target_size = int(np.sqrt(original_area * 1.4))  # 40% area increase
            return target_size, target_size
        elif target_aspect == "portrait":
            # 3:4 aspect ratio
            ratio = 3 / 4
            target_width = int(np.sqrt(original_area * ratio * 1.3))
            target_height = int(target_width / ratio)
            return target_width, target_height
        elif target_aspect == "landscape":
            # 4:3 aspect ratio
            ratio = 4 / 3
            target_width = int(np.sqrt(original_area * ratio * 1.3))
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
        """Calculate optimal positioning with boundary checks."""
        
        # Ensure original image fits in target canvas
        if original_width > target_width or original_height > target_height:
            scale = min(target_width / original_width, target_height / original_height) * 0.8
            original_width = int(original_width * scale)
            original_height = int(original_height * scale)
        
        if aspect_ratio == "portrait":
            if position == "center":
                x_offset = (target_width - original_width) // 2
                y_offset = (target_height - original_height) // 2
            elif position == "up":
                x_offset = (target_width - original_width) // 2
                y_offset = max(0, target_height // 6)  # Not exactly top
            elif position == "down":
                x_offset = (target_width - original_width) // 2
                y_offset = target_height - original_height - max(0, target_height // 6)
            else:
                x_offset = (target_width - original_width) // 2
                y_offset = (target_height - original_height) // 2
                
        elif aspect_ratio == "landscape":
            if position == "center":
                x_offset = (target_width - original_width) // 2
                y_offset = (target_height - original_height) // 2
            elif position == "left":
                x_offset = max(0, target_width // 6)
                y_offset = (target_height - original_height) // 2
            elif position == "right":
                x_offset = target_width - original_width - max(0, target_width // 6)
                y_offset = (target_height - original_height) // 2
            else:
                x_offset = (target_width - original_width) // 2
                y_offset = (target_height - original_height) // 2
                
        elif aspect_ratio == "square":
            if position == "center":
                x_offset = (target_width - original_width) // 2
                y_offset = (target_height - original_height) // 2
            elif position == "top-left":
                x_offset = max(0, target_width // 8)
                y_offset = max(0, target_height // 8)
            elif position == "top-right":
                x_offset = target_width - original_width - max(0, target_width // 8)
                y_offset = max(0, target_height // 8)
            elif position == "bottom-left":
                x_offset = max(0, target_width // 8)
                y_offset = target_height - original_height - max(0, target_height // 8)
            elif position == "bottom-right":
                x_offset = target_width - original_width - max(0, target_width // 8)
                y_offset = target_height - original_height - max(0, target_height // 8)
            else:
                x_offset = (target_width - original_width) // 2
                y_offset = (target_height - original_height) // 2
        
        return (max(0, min(x_offset, target_width - original_width)), 
                max(0, min(y_offset, target_height - original_height)))
    
    def create_smart_mask(self, image: np.ndarray, original_rect: Tuple[int, int, int, int]) -> np.ndarray:
        """Create an intelligent mask for better inpainting."""
        height, width = image.shape[:2]
        mask = np.zeros((height, width), dtype=np.uint8)
        
        x, y, w, h = original_rect
        
        # Basic mask: areas to inpaint
        mask[:, :] = 255
        mask[y:y+h, x:x+w] = 0
        
        # Create feathered edges for smoother blending
        feather_size = max(5, min(w, h) // 20)
        
        # Create distance transform for smooth falloff
        inner_mask = np.zeros_like(mask)
        inner_mask[y+feather_size:y+h-feather_size, x+feather_size:x+w-feather_size] = 255
        
        # Distance transform creates gradient
        dist_transform = cv2.distanceTransform(255 - inner_mask, cv2.DIST_L2, 5)
        
        # Normalize and create gradient mask
        if dist_transform.max() > 0:
            dist_transform = dist_transform / dist_transform.max()
            gradient_mask = (dist_transform * 255).astype(np.uint8)
            
            # Apply gradient only near the edges
            edge_region = cv2.dilate(inner_mask, np.ones((feather_size*2, feather_size*2), np.uint8))
            mask = np.where(edge_region > 0, np.minimum(mask, gradient_mask), mask)
        
        return mask
    
    def enhanced_content_aware_fill(self, image: np.ndarray, mask: np.ndarray, is_premium: bool = False) -> np.ndarray:
        """Enhanced content-aware fill with multiple techniques."""
        try:
            if self.model_initialized and is_premium:
                return self._onnx_inpaint(image, mask)
            else:
                return self._traditional_enhanced_inpaint(image, mask)
        except Exception as e:
            logger.error(f"Enhanced inpainting failed: {e}")
            return self._fallback_intelligent_fill(image, mask)
    
    def _onnx_inpaint(self, image: np.ndarray, mask: np.ndarray) -> np.ndarray:
        """Use ONNX model for high-quality inpainting."""
        try:
            # Prepare input for ONNX model
            input_image = cv2.resize(image, (512, 512))
            input_mask = cv2.resize(mask, (512, 512))
            
            # Normalize inputs
            input_image = input_image.astype(np.float32) / 255.0
            input_mask = (input_mask > 128).astype(np.float32)
            
            # Add batch dimension and transpose for ONNX
            input_image = np.transpose(input_image[None, ...], (0, 3, 1, 2))
            input_mask = input_mask[None, None, ...]
            
            # Run inference
            outputs = self.session.run(None, {
                'image': input_image,
                'mask': input_mask
            })
            
            # Process output
            result = outputs[0][0]
            result = np.transpose(result, (1, 2, 0))
            result = (result * 255).astype(np.uint8)
            
            # Resize back to original size
            original_h, original_w = image.shape[:2]
            result = cv2.resize(result, (original_w, original_h))
            
            return result
            
        except Exception as e:
            logger.error(f"ONNX inpainting failed: {e}")
            return self._traditional_enhanced_inpaint(image, mask)
    
    def _traditional_enhanced_inpaint(self, image: np.ndarray, mask: np.ndarray) -> np.ndarray:
        """Enhanced traditional inpainting with multiple algorithms."""
        
        # Try Navier-Stokes method first (better for smooth regions)
        result1 = cv2.inpaint(image, mask, 5, cv2.INPAINT_NS)
        
        # Try Fast Marching Method (better for textured regions)
        result2 = cv2.inpaint(image, mask, 5, cv2.INPAINT_TELEA)
        
        # Combine results using mask weights
        mask_normalized = mask.astype(np.float32) / 255.0
        
        # Create edge map to decide which method to use where
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        edge_dilated = cv2.dilate(edges, np.ones((5, 5), np.uint8))
        
        # Use TELEA near edges, NS in smooth areas
        edge_weight = edge_dilated.astype(np.float32) / 255.0
        edge_weight = edge_weight[:, :, np.newaxis] if len(image.shape) == 3 else edge_weight
        
        # Combine methods
        combined = (result2 * edge_weight + result1 * (1 - edge_weight)).astype(np.uint8)
        
        # Apply some post-processing
        combined = self._post_process_inpaint(combined, image, mask)
        
        return combined
    
    def _post_process_inpaint(self, inpainted: np.ndarray, original: np.ndarray, mask: np.ndarray) -> np.ndarray:
        """Post-process inpainted image for better quality."""
        
        # Slight gaussian blur to smooth artifacts
        blurred = cv2.GaussianBlur(inpainted, (3, 3), 0.8)
        
        # Apply sharpening selectively
        kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
        sharpened = cv2.filter2D(blurred, -1, kernel)
        
        # Blend sharpened with blurred based on local contrast
        gray = cv2.cvtColor(inpainted, cv2.COLOR_BGR2GRAY)
        local_std = cv2.Laplacian(gray, cv2.CV_64F)
        local_std = np.abs(local_std)
        local_std = cv2.GaussianBlur(local_std, (5, 5), 0)
        
        # Normalize contrast measure
        if local_std.max() > 0:
            local_std = local_std / local_std.max()
        
        local_std = local_std[:, :, np.newaxis] if len(inpainted.shape) == 3 else local_std
        
        # Apply more sharpening to high-contrast areas
        result = (sharpened * local_std + blurred * (1 - local_std)).astype(np.uint8)
        
        # Slight color enhancement
        if len(result.shape) == 3:
            # Convert to LAB color space for better color enhancement
            lab = cv2.cvtColor(result, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            
            # Enhance lightness slightly
            l = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(l)
            
            enhanced = cv2.merge([l, a, b])
            result = cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)
        
        return result
    
    def _fallback_intelligent_fill(self, image: np.ndarray, mask: np.ndarray) -> np.ndarray:
        """Intelligent fallback method using patch-based filling."""
        result = image.copy()
        height, width = image.shape[:2]
        
        # Find regions to fill
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for contour in contours:
            # Get bounding box of region to fill
            x, y, w, h = cv2.boundingRect(contour)
            
            # Extract region
            region_mask = mask[y:y+h, x:x+w]
            region_image = result[y:y+h, x:x+w]
            
            # Find best patches from nearby areas
            filled_region = self._patch_based_fill(region_image, region_mask, image, (x, y))
            
            # Blend back
            mask_3d = (region_mask[:, :, np.newaxis] / 255.0) if len(image.shape) == 3 else (region_mask / 255.0)
            result[y:y+h, x:x+w] = (filled_region * mask_3d + region_image * (1 - mask_3d)).astype(np.uint8)
        
        return result
    
    def _patch_based_fill(self, region: np.ndarray, region_mask: np.ndarray, 
                         full_image: np.ndarray, offset: Tuple[int, int]) -> np.ndarray:
        """Fill region using patches from the full image."""
        
        patch_size = 16
        result = region.copy()
        
        # Get coordinates of pixels to fill
        fill_coords = np.where(region_mask > 128)
        
        if len(fill_coords[0]) == 0:
            return result
        
        # Sample patches from the original image
        for i in range(0, len(fill_coords[0]), patch_size // 2):
            try:
                y_fill = fill_coords[0][i]
                x_fill = fill_coords[1][i]
                
                # Find best matching patch from nearby area
                best_patch = self._find_best_patch(full_image, (x_fill + offset[0], y_fill + offset[1]), patch_size)
                
                if best_patch is not None:
                    # Apply patch with blending
                    end_y = min(y_fill + patch_size, region.shape[0])
                    end_x = min(x_fill + patch_size, region.shape[1])
                    patch_h = end_y - y_fill
                    patch_w = end_x - x_fill
                    
                    if patch_h > 0 and patch_w > 0:
                        patch_resized = cv2.resize(best_patch, (patch_w, patch_h))
                        
                        # Create blending mask
                        blend_mask = np.ones((patch_h, patch_w), dtype=np.float32) * 0.7
                        blend_mask = cv2.GaussianBlur(blend_mask, (5, 5), 2.0)
                        
                        if len(region.shape) == 3:
                            blend_mask = blend_mask[:, :, np.newaxis]
                        
                        # Blend patch
                        region_patch = result[y_fill:end_y, x_fill:end_x]
                        blended = (patch_resized * blend_mask + region_patch * (1 - blend_mask)).astype(np.uint8)
                        result[y_fill:end_y, x_fill:end_x] = blended
                        
            except Exception as e:
                logger.debug(f"Patch filling failed for one patch: {e}")
                continue
        
        return result
    
    def _find_best_patch(self, image: np.ndarray, center: Tuple[int, int], patch_size: int) -> np.ndarray:
        """Find the best matching patch from the image."""
        try:
            x_center, y_center = center
            half_patch = patch_size // 2
            
            # Define search area (avoid the center area)
            search_radius = min(100, min(image.shape[0], image.shape[1]) // 4)
            
            best_patch = None
            min_distance = float('inf')
            
            # Sample a few candidate patches
            for _ in range(10):
                # Random offset within search radius
                dx = np.random.randint(-search_radius, search_radius)
                dy = np.random.randint(-search_radius, search_radius)
                
                # Avoid center area
                if abs(dx) < patch_size and abs(dy) < patch_size:
                    continue
                
                patch_x = max(half_patch, min(image.shape[1] - half_patch, x_center + dx))
                patch_y = max(half_patch, min(image.shape[0] - half_patch, y_center + dy))
                
                # Extract patch
                patch = image[patch_y - half_patch:patch_y + half_patch,
                             patch_x - half_patch:patch_x + half_patch]
                
                if patch.shape[0] == patch_size and patch.shape[1] == patch_size:
                    # Simple patch quality score (prefer patches with some texture)
                    gray_patch = cv2.cvtColor(patch, cv2.COLOR_BGR2GRAY) if len(patch.shape) == 3 else patch
                    texture_score = cv2.Laplacian(gray_patch, cv2.CV_64F).var()
                    
                    if texture_score < min_distance and texture_score > 10:  # Some minimum texture
                        min_distance = texture_score
                        best_patch = patch.copy()
            
            return best_patch
            
        except Exception as e:
            logger.debug(f"Best patch search failed: {e}")
            return None
    
    def process_enlargement(self, 
                          input_image: np.ndarray, 
                          target_aspect: AspectRatio,
                          position: str,
                          is_premium: bool = False) -> np.ndarray:
        """Main processing function for image enlargement."""
        original_height, original_width = input_image.shape[:2]
        
        # Calculate target dimensions
        target_width, target_height = self.calculate_target_dimensions(
            original_width, original_height, target_aspect
        )
        
        logger.info(f"Enlarging from {original_width}x{original_height} to {target_width}x{target_height}")
        
        # Calculate positioning
        x_offset, y_offset = self.calculate_positioning(
            original_width, original_height,
            target_width, target_height,
            target_aspect, position
        )
        
        # Scale original image if needed to fit better
        if original_width > target_width * 0.9 or original_height > target_height * 0.9:
            scale = min(target_width / original_width, target_height / original_height) * 0.8
            new_width = int(original_width * scale)
            new_height = int(original_height * scale)
            input_image = cv2.resize(input_image, (new_width, new_height), interpolation=cv2.INTER_LANCZOS4)
            original_width, original_height = new_width, new_height
            
            # Recalculate positioning
            x_offset, y_offset = self.calculate_positioning(
                original_width, original_height,
                target_width, target_height,
                target_aspect, position
            )
        
        # Create new canvas with intelligent background
        new_canvas = self._create_smart_background(input_image, target_width, target_height)
        
        # Place original image
        end_y = min(y_offset + original_height, target_height)
        end_x = min(x_offset + original_width, target_width)
        actual_h = end_y - y_offset
        actual_w = end_x - x_offset
        
        new_canvas[y_offset:end_y, x_offset:end_x] = input_image[:actual_h, :actual_w]
        
        # Create smart mask
        mask = self.create_smart_mask(new_canvas, (x_offset, y_offset, actual_w, actual_h))
        
        # Apply enhanced content-aware fill
        result = self.enhanced_content_aware_fill(new_canvas, mask, is_premium)
        
        logger.info(f"Successfully enlarged image with {target_aspect} aspect ratio")
        
        return result
    
    def _create_smart_background(self, sample_image: np.ndarray, width: int, height: int) -> np.ndarray:
        """Create an intelligent background based on the sample image."""
        
        # Analyze dominant colors in the image
        if len(sample_image.shape) == 3:
            # Get average color from edges
            edge_pixels = np.concatenate([
                sample_image[0, :],      # top edge
                sample_image[-1, :],     # bottom edge
                sample_image[:, 0],      # left edge
                sample_image[:, -1]      # right edge
            ])
            avg_color = np.mean(edge_pixels, axis=0)
            
            # Create gradient background
            canvas = np.zeros((height, width, 3), dtype=np.uint8)
            
            # Create subtle gradient
            for y in range(height):
                for x in range(width):
                    # Distance from center
                    center_x, center_y = width // 2, height // 2
                    dist = np.sqrt((x - center_x)**2 + (y - center_y)**2)
                    max_dist = np.sqrt(center_x**2 + center_y**2)
                    
                    # Gradient factor
                    gradient_factor = 1.0 - (dist / max_dist) * 0.1  # Very subtle
                    
                    canvas[y, x] = (avg_color * gradient_factor).astype(np.uint8)
        else:
            # Grayscale
            avg_intensity = np.mean([
                np.mean(sample_image[0, :]),
                np.mean(sample_image[-1, :]),
                np.mean(sample_image[:, 0]),
                np.mean(sample_image[:, -1])
            ])
            canvas = np.full((height, width), avg_intensity, dtype=np.uint8)
        
        return canvas


async def perform_image_enlargement(
    job_id: str,
    image_url: str,
    config: Dict[str, Any]
) -> Tuple[str, Dict[str, Any]]:
    """
    Perform enhanced image enlargement with generative fill.
    """
    logger.info(f"Processing enhanced enlargement job {job_id}")
    
    try:
        # Extract configuration
        aspect_ratio = config.get('aspectRatio', 'square')
        position = config.get('position', 'center')
        quality = config.get('quality', 'FREE').upper()
        is_premium = quality == 'PREMIUM'
        
        # Download and process imageS
        logger.info(f"Downloading image from: {image_url}")
        input_image_bytes = CloudinaryService.download_image_from_url(image_url)
        
        nparr = np.frombuffer(input_image_bytes, np.uint8)
        input_image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if input_image is None:
            raise ValueError("Failed to decode input image")
        
        # Initialize enhanced processor
        enlarger = LightweightImageEnlarger()
        
        logger.info(f"Processing {quality.lower()} quality enlargement")
        
        # Perform enlargement
        output_image = enlarger.process_enlargement(
            input_image, aspect_ratio, position, is_premium
        )
        
        # Encode results
        is_success, buffer = cv2.imencode('.png', output_image, [cv2.IMWRITE_PNG_COMPRESSION, 6])
        if not is_success:
            raise RuntimeError("Failed to encode output image")
        
        output_bytes = buffer.tobytes()
        
        # Create thumbnail
        height, width = output_image.shape[:2]
        thumb_scale = min(600/width, 450/height, 1.0)
        
        if thumb_scale < 1.0:
            new_width = int(width * thumb_scale)
            new_height = int(height * thumb_scale)
            thumbnail_image = cv2.resize(output_image, (new_width, new_height), interpolation=cv2.INTER_AREA)
        else:
            thumbnail_image = output_image.copy()
        
        is_success, thumb_buffer = cv2.imencode('.png', thumbnail_image, [cv2.IMWRITE_PNG_COMPRESSION, 8])
        if not is_success:
            raise RuntimeError("Failed to encode thumbnail")
        
        thumbnail_bytes = thumb_buffer.tobytes()
        
        # Upload to Cloudinary
        processed_url, processed_public_id = CloudinaryService.upload_processed_image(
            output_bytes, job_id, "enlarged"
        )
        
        thumbnail_url, thumbnail_public_id = CloudinaryService.upload_thumbnail(
            thumbnail_bytes, job_id
        )
        
        logger.info(f"Enhanced enlargement completed for job {job_id}")
        
        # Processing info
        original_height, original_width = input_image.shape[:2]
        output_height, output_width = output_image.shape[:2]
        
        processing_info = {
            "processing_type": "enhanced_image_enlargement",
            "algorithm": "lightweight_generative_fill",
            "model_type": "onnx_inpainting" if enlarger.model_initialized and is_premium else "enhanced_traditional",
            "aspect_ratio": aspect_ratio,
            "position": position,
            "quality_level": quality.lower(),
            "original_size": f"{original_width}x{original_height}",
            "output_size": f"{output_width}x{output_height}",
            "area_increase_factor": round((output_width * output_height) / (original_width * original_height), 2),
            "full_quality_public_id": processed_public_id,
            "thumbnail_public_id": thumbnail_public_id,
            "thumbnail_url": thumbnail_url,
            "is_premium": is_premium
        }
        
        return processed_url, processing_info
        
    except Exception as e:
        logger.error(f"Enhanced enlargement failed for job {job_id}: {e}")
        raise ImageProcessingError(f"Enhanced enlargement failed: {e}")