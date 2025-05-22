"""
Image processing module for upscaling with Real-ESRGAN integration.
"""

import logging
import os
import cv2
import numpy as np
from typing import Dict, Tuple, Any
import urllib.request
from pathlib import Path
from realesrgan import RealESRGANer
from basicsr.archs.rrdbnet_arch import RRDBNet

from app.cloudinary_service import CloudinaryService
from app.config import MODELS_DIR

logger = logging.getLogger(__name__)

class UpscalingProcessor:
    def __init__(self):
        self.models = {}
        self.model_configs = {
            'RealESRGAN_x2plus': {
                'url': 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.1/RealESRGAN_x2plus.pth',
                'scale': 2,
                'filename': 'RealESRGAN_x2plus.pth'
            },
            'RealESRGAN_x4plus': {
                'url': 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth',
                'scale': 4,
                'filename': 'RealESRGAN_x4plus.pth'
            }
        }
        self._initialize_models()
    
    def _download_model(self, model_name: str) -> str:
        """Download model if it doesn't exist."""
        if model_name not in self.model_configs:
            raise ValueError(f"Unknown model: {model_name}")
        
        config = self.model_configs[model_name]
        model_path = os.path.join(MODELS_DIR, config['filename'])
        
        if not os.path.exists(model_path):
            logger.info(f"Downloading {model_name} from {config['url']}")
            try:
                # Create directory if it doesn't exist
                os.makedirs(MODELS_DIR, exist_ok=True)
                
                # Download the model
                urllib.request.urlretrieve(config['url'], model_path)
                logger.info(f"Successfully downloaded {model_name} to {model_path}")
            except Exception as e:
                logger.error(f"Failed to download {model_name}: {e}")
                raise RuntimeError(f"Could not download model {model_name}: {e}")
        else:
            logger.info(f"Model {model_name} already exists at {model_path}")
        
        return model_path
    
    def _initialize_models(self):
        """Initialize Real-ESRGAN models for different quality levels."""
        try:
            logger.info(f"Initializing models in directory: {MODELS_DIR}")
            
            # Free model: RealESRGAN_x2plus
            self.models['free'] = self._load_model('RealESRGAN_x2plus')
            
            # Premium model: RealESRGAN_x4plus  
            self.models['premium'] = self._load_model('RealESRGAN_x4plus')
            
            logger.info("Successfully initialized all upscaling models")
            
        except Exception as e:
            logger.error(f"Failed to initialize models: {e}")
            raise RuntimeError(f"Model initialization failed: {e}")
    
    def _load_model(self, model_name: str):
        """Load a Real-ESRGAN model with automatic download."""
        try:
            logger.info(f"Loading model: {model_name}")
            
            # Download model if needed
            model_path = self._download_model(model_name)
            config = self.model_configs[model_name]
            scale = config['scale']
            
            # Define model architecture based on scale
            if scale == 2:
                model = RRDBNet(
                    num_in_ch=3, 
                    num_out_ch=3, 
                    num_feat=64, 
                    num_block=23, 
                    num_grow_ch=32, 
                    scale=2
                )
            elif scale == 4:
                model = RRDBNet(
                    num_in_ch=3, 
                    num_out_ch=3, 
                    num_feat=64, 
                    num_block=23, 
                    num_grow_ch=32, 
                    scale=4
                )
            else:
                raise ValueError(f"Unsupported scale: {scale}")
            
            # Initialize upsampler with downloaded model
            upsampler = RealESRGANer(
                scale=scale,
                model_path=model_path,  # Use the downloaded model path
                dni_weight=None,
                model=model,
                tile=0,
                tile_pad=10,
                pre_pad=0,
                half=False,  # Use FP32 for better compatibility
                gpu_id=None  # Auto-detect GPU
            )
            
            logger.info(f"Successfully loaded model: {model_name} from {model_path}")
            return upsampler
            
        except Exception as e:
            logger.error(f"Failed to load model {model_name}: {str(e)}")
            raise RuntimeError(f"Could not initialize {model_name}: {e}")


async def perform_upscaling(
    job_id: str,
    image_url: str,
    config: Dict[str, Any]
) -> Tuple[str, Dict[str, Any]]:
    """
    Perform image upscaling using Real-ESRGAN.
    
    Args:
        job_id: Unique job identifier
        image_url: Cloudinary URL of the original image
        config: Processing configuration with 'quality' key
        
    Returns:
        Tuple of (processed_image_url, processing_info)
    """
    logger.info(f"Processing upscaling job {job_id} with image URL: {image_url}")
    
    processor = None
    try:
        # Get quality level from config (default to free)
        quality = config.get('quality', 'FREE').upper()
        is_premium = quality == 'PREMIUM'
        
        # Download image from Cloudinary
        logger.info(f"Downloading image from Cloudinary: {image_url}")
        input_image_bytes = CloudinaryService.download_image_from_url(image_url)
        
        # Convert bytes to opencv image
        nparr = np.frombuffer(input_image_bytes, np.uint8)
        input_image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if input_image is None:
            raise ValueError("Failed to decode input image")
        
        # Initialize processor
        logger.info("Initializing UpscalingProcessor...")
        processor = UpscalingProcessor()
        
        # Select model based on quality
        model_key = 'premium' if is_premium else 'free'
        upsampler = processor.models[model_key]
        
        if upsampler is None:
            raise RuntimeError(f"Failed to load {model_key} upscaling model")
        
        logger.info(f"Performing {quality.lower()} quality upscaling for job {job_id}")
        
        # Perform upscaling
        try:
            output_image, _ = upsampler.enhance(input_image, outscale=None)
        except Exception as e:
            logger.error(f"Upscaling enhancement failed: {e}")
            raise RuntimeError(f"Upscaling process failed: {e}")
        
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
            output_bytes, job_id, "upscaled"
        )
        
        # Upload thumbnail to Cloudinary  
        thumbnail_url, thumbnail_public_id = CloudinaryService.upload_thumbnail(
            thumbnail_bytes, job_id
        )

        logger.info(f"Successfully processed upscaling job {job_id}")
        logger.info(f"Full quality URL: {processed_url}")
        logger.info(f"Thumbnail URL: {thumbnail_url}")

        # Calculate scale factor
        original_height, original_width = input_image.shape[:2]
        output_height, output_width = output_image.shape[:2]
        scale_factor = output_width / original_width

        processing_info = {
            "model_used": "RealESRGAN_x4plus" if is_premium else "RealESRGAN_x2plus",
            "quality_level": quality.lower(),
            "scale_factor": round(scale_factor, 2),
            "original_size": f"{original_width}x{original_height}",
            "output_size": f"{output_width}x{output_height}",
            "processing_time_seconds": 0,
            "full_quality_public_id": processed_public_id,
            "thumbnail_public_id": thumbnail_public_id,
            "thumbnail_url": thumbnail_url,
            "is_premium": is_premium
        }

        return processed_url, processing_info

    except Exception as e:
        logger.error(f"Upscaling failed for job {job_id}: {e}")
        raise RuntimeError(f"Upscaling failed: {e}")
    finally:
        # Clean up if needed
        if processor:
            del processor