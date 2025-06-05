"""
Style transfer processing module using OmniConsistency model.
Implements AI-powered artistic style transfer with various art styles.
"""

import logging
import time
import traceback
from typing import Dict, Tuple, Any, Optional
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

logger = logging.getLogger(__name__)

class StyleTransferError(Exception):
    """Custom exception for style transfer processing errors."""
    pass

# Global pipeline cache
_pipeline_cache: Optional[FluxPipeline] = None
_pipeline_lock = threading.Lock()

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