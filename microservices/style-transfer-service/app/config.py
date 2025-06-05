"""
Configuration module for the SDXL style transfer service.
Loads and validates environment variables.
"""

import os
import logging
import torch
from typing import Optional
from dotenv import load_dotenv
from pathlib import Path
from typing import Dict,Any


# Load environment variables from .env file
load_dotenv()

# Configure logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# RabbitMQ Configuration
RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")
CONSUME_QUEUE_NAME = os.getenv("CONSUME_QUEUE_NAME", "q_style_transfer")
CONSUME_EXCHANGE_NAME = os.getenv("CONSUME_EXCHANGE_NAME", "image_processing_exchange")
CONSUME_ROUTING_KEY = os.getenv("CONSUME_ROUTING_KEY", "job.style_transfer")

# Spring Boot Callback Configuration
SPRING_BOOT_CALLBACK_URL_TEMPLATE = os.getenv(
    "SPRING_BOOT_CALLBACK_URL_TEMPLATE",
    "http://localhost:8080/api/v1/jobs/{job_id}/status"
)

# Service Configuration
SERVICE_PORT = int(os.getenv("PORT", "8004"))
SERVICE_HOST = os.getenv("HOST", "0.0.0.0")

BASE_DIR = Path(__file__).resolve().parent.parent  # Goes up to style-transfer-service/

# Models directory relative to project root
MODELS_DIR = os.environ.get('MODELS_DIR', str(BASE_DIR / 'models'))

# Ensure the directory exists
os.makedirs(MODELS_DIR, exist_ok=True)

# Device Configuration - Auto-detect optimal device
def get_optimal_device() -> str:
    """Automatically detect the best available device."""
    if torch.cuda.is_available():
        gpu_count = torch.cuda.device_count()
        gpu_name = torch.cuda.get_device_name(0) if gpu_count > 0 else "Unknown"
        vram = torch.cuda.get_device_properties(0).total_memory / (1024**3) if gpu_count > 0 else 0

        logger.info(f"🎮 CUDA available: {gpu_count} GPU(s)")
        logger.info(f"🎮 GPU: {gpu_name}, VRAM: {vram:.1f}GB")

        # Forzar uso GPU siempre que haya CUDA
        return "cuda"
    elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
        logger.info("🍎 MPS (Apple Silicon) available")
        return "mps"
    else:
        logger.info("💻 Using CPU")
        return "cpu"


# Set device
DEVICE = os.getenv("DEVICE", get_optimal_device())

SDXL_CONFIG = {
    "base_model": "hakurei/waifu-diffusion-v1-3",

    "refiner_model": os.getenv("SDXL_REFINER_MODEL", "stabilityai/stable-diffusion-xl-refiner-1.0"),
  "vae_model": "stabilityai/sd-vae-ft-mse",
    "scheduler": os.getenv("SDXL_SCHEDULER", "euler_ancestral"),
    "use_refiner": os.getenv("USE_REFINER", "false").lower() == "true",
    "safety_checker": os.getenv("ENABLE_SAFETY_CHECKER", "false").lower() == "true"
}


# Generation Parameters
DEFAULT_CONFIG = {
    "free_quality": {
        "inference_steps": int(os.getenv("FREE_INFERENCE_STEPS", "20")),
        "guidance_scale": float(os.getenv("FREE_GUIDANCE_SCALE", "7.0")),
        "max_resolution": int(os.getenv("FREE_MAX_RESOLUTION", "200")),
        "strength_range": (0.3, 0.9)
    },
    "premium_quality": {
        "inference_steps": int(os.getenv("PREMIUM_INFERENCE_STEPS", "35")),
        "guidance_scale": float(os.getenv("PREMIUM_GUIDANCE_SCALE", "7.5")),
        "max_resolution": int(os.getenv("PREMIUM_MAX_RESOLUTION", "1024")),
        "strength_range": (0.2, 0.8)
    }
}

# Available Art Styles (expanded list)
AVAILABLE_STYLES = [
    # Cartoon & Animation
    "3D_Chibi", "American_Cartoon", "Ghibli", "Anime", "Disney", "Pixar",
    
    # Traditional Art
    "Chinese_Ink", "Oil_Painting", "Watercolor", "Acrylic_Painting", "Charcoal_Drawing",
    
    # Famous Artists
    "Van_Gogh", "Picasso", "Monet", "Da_Vinci", "Warhol", "Banksy",
    
    # Modern Styles
    "Pop_Art", "Street_Art", "Graffiti", "Comic_Book", "Manga", "Concept_Art",
    
    # Digital Art
    "Pixel", "Vector", "Low_Poly", "Cyberpunk", "Synthwave", "Neon",
    
    # Textures & Materials
    "Clay_Toy", "Fabric", "Paper_Cutting", "Origami", "LEGO", "Glass_Art",
    
    # Artistic Movements
    "Impressionist", "Cubist", "Surreal", "Abstract", "Minimalist", "Art_Nouveau"
]

# Memory Management
MEMORY_CONFIG = {
    "enable_attention_slicing": os.getenv("ENABLE_ATTENTION_SLICING", "true").lower() == "true",
    "enable_vae_slicing": os.getenv("ENABLE_VAE_SLICING", "true").lower() == "true",
    "enable_xformers": os.getenv("ENABLE_XFORMERS", "true").lower() == "true",
    "enable_torch_compile": os.getenv("ENABLE_TORCH_COMPILE", "true").lower() == "true",
    "low_cpu_mem_usage": os.getenv("LOW_CPU_MEM_USAGE", "true").lower() == "true"
}

# Cache Configuration
CACHE_CONFIG = {
    "model_cache_dir": MODELS_DIR,
    "max_cache_size_gb": int(os.getenv("MAX_CACHE_SIZE_GB", "10")),
    "auto_cleanup": os.getenv("AUTO_CLEANUP_CACHE", "true").lower() == "true",
    "cleanup_threshold_gb": int(os.getenv("CLEANUP_THRESHOLD_GB", "8"))
}

# Performance Tuning
PERFORMANCE_CONFIG = {
    "max_concurrent_jobs": int(os.getenv("MAX_CONCURRENT_JOBS", "1")),
    "batch_size": int(os.getenv("BATCH_SIZE", "1")),
    "compile_mode": os.getenv("COMPILE_MODE", "reduce-overhead"),  # "default", "reduce-overhead", "max-autotune"
    "mixed_precision": os.getenv("MIXED_PRECISION", "fp16"),  # "fp16", "bf16", "fp32"
}

def validate_config() -> bool:
    """
    Validate that all required configuration values are present.
    
    Returns:
        bool: True if validation is successful.
    
    Raises:
        ValueError: If any required configuration is missing.
    """
    required_vars = [
        "RABBITMQ_URL",
        "CONSUME_QUEUE_NAME", 
        "CONSUME_EXCHANGE_NAME",
        "CONSUME_ROUTING_KEY",
        "SPRING_BOOT_CALLBACK_URL_TEMPLATE",
    ]
    
    missing_vars = [var for var in required_vars if not globals().get(var)]
    
    if missing_vars:
        error_msg = f"Missing required environment variables: {', '.join(missing_vars)}"
        logger.error(error_msg)
        raise ValueError(error_msg)
    
    # Validate device
    if DEVICE not in ["cuda", "cpu", "mps"]:
        logger.warning(f"Invalid device '{DEVICE}', falling back to CPU")
        globals()["DEVICE"] = "cpu"
    
    # Log configuration on startup (excluding sensitive info)
    logger.info("=" * 60)
    logger.info("🎨 SDXL Style Transfer Service Configuration")
    logger.info("=" * 60)
    logger.info(f"📡 RabbitMQ: {RABBITMQ_URL.split('@')[0]}@***")
    logger.info(f"📮 Queue: {CONSUME_QUEUE_NAME}")
    logger.info(f"🔄 Exchange: {CONSUME_EXCHANGE_NAME}")
    logger.info(f"🎯 Routing Key: {CONSUME_ROUTING_KEY}")
    logger.info(f"📞 Callback: {SPRING_BOOT_CALLBACK_URL_TEMPLATE}")
    logger.info("-" * 60)
    logger.info(f"🎮 Device: {DEVICE}")
    logger.info(f"🧠 Base Model: {SDXL_CONFIG['base_model']}")
    logger.info(f"🎨 Available Styles: {len(AVAILABLE_STYLES)}")
    logger.info(f"📁 Models Directory: {MODELS_DIR}")
    logger.info(f"🔧 Max Concurrent Jobs: {PERFORMANCE_CONFIG['max_concurrent_jobs']}")
    
    if DEVICE == "cuda":
        gpu_count = torch.cuda.device_count()
        if gpu_count > 0:
            gpu_memory = torch.cuda.get_device_properties(0).total_memory / (1024**3)
            logger.info(f"🎮 GPU Memory: {gpu_memory:.1f}GB")
            
    logger.info(f"💾 Memory Optimizations:")
    logger.info(f"   - Attention Slicing: {MEMORY_CONFIG['enable_attention_slicing']}")
    logger.info(f"   - VAE Slicing: {MEMORY_CONFIG['enable_vae_slicing']}")
    logger.info(f"   - XFormers: {MEMORY_CONFIG['enable_xformers']}")
    logger.info(f"   - Torch Compile: {MEMORY_CONFIG['enable_torch_compile']}")
    logger.info("=" * 60)
    
    return True

def get_style_display_names() -> Dict[str, str]:
    """Get user-friendly display names for styles."""
    return {
        style: style.replace("_", " ").title()
        for style in AVAILABLE_STYLES
    }

def get_device_info() -> Dict[str, Any]:
    """Get detailed device information."""
    info = {
        "device": DEVICE,
        "torch_version": torch.__version__,
        "cuda_available": torch.cuda.is_available(),
        "mps_available": hasattr(torch.backends, 'mps') and torch.backends.mps.is_available()
    }
    
    if torch.cuda.is_available():
        info.update({
            "cuda_version": torch.version.cuda,
            "gpu_count": torch.cuda.device_count(),
            "gpu_names": [torch.cuda.get_device_name(i) for i in range(torch.cuda.device_count())],
            "gpu_memory": [
                torch.cuda.get_device_properties(i).total_memory / (1024**3) 
                for i in range(torch.cuda.device_count())
            ]
        })
    
    return info