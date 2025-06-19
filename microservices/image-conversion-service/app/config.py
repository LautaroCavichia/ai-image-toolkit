"""
Configuration module for the image conversion service.
Loads and validates environment variables.
"""

import os
import logging
from typing import Optional
from dotenv import load_dotenv

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
CONSUME_QUEUE_NAME = os.getenv("CONSUME_QUEUE_NAME", "q_image_conversion")
CONSUME_EXCHANGE_NAME = os.getenv("CONSUME_EXCHANGE_NAME", "image_processing_exchange")
CONSUME_ROUTING_KEY = os.getenv("CONSUME_ROUTING_KEY", "job.image_conversion")

# Spring Boot Callback Configuration
SPRING_BOOT_CALLBACK_URL_TEMPLATE = os.getenv(
    "SPRING_BOOT_CALLBACK_URL_TEMPLATE",
    "http://localhost:8080/api/v1/jobs/{job_id}/status"
)

# Service Configuration
SERVICE_PORT = int(os.getenv("PORT", "8005"))
SERVICE_HOST = os.getenv("HOST", "0.0.0.0")

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
    
    # Log configuration on startup (excluding sensitive info)
    logger.info(f"Configuration loaded: RABBITMQ_URL={RABBITMQ_URL} (connection string masked)")
    logger.info(f"Queue: {CONSUME_QUEUE_NAME}, Exchange: {CONSUME_EXCHANGE_NAME}, Routing Key: {CONSUME_ROUTING_KEY}")
    logger.info(f"Callback URL Template: {SPRING_BOOT_CALLBACK_URL_TEMPLATE}")
    
    return True