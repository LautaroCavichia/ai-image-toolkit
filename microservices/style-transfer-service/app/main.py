"""
Main application module for the SDXL style transfer service.
Implements FastAPI app, RabbitMQ consumer, and job processing logic with SDXL integration.
"""

import json
import asyncio
import logging
import traceback
from typing import Dict, Any, Optional
import os

import aio_pika
import httpx
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from aio_pika.abc import AbstractIncomingMessage, AbstractRobustConnection

from app.config import (
    RABBITMQ_URL,
    CONSUME_QUEUE_NAME,
    CONSUME_EXCHANGE_NAME,
    CONSUME_ROUTING_KEY,
    SPRING_BOOT_CALLBACK_URL_TEMPLATE,
    validate_config,
    SERVICE_HOST,
    SERVICE_PORT,
    AVAILABLE_STYLES,
    DEVICE,
    SDXL_CONFIG,
    get_device_info,
    get_style_display_names
)
from app.processing import (
    perform_style_transfer, 
    get_system_status, 
    force_reset_system,
    clear_cache,
    clear_active_jobs,
    get_active_jobs_count
)
from app.dto import (
    JobMessageDTO, 
    JobStatusUpdateRequestDTO, 
    JobStatus, 
    JobType,
    StyleCatalogDTO,
    SystemStatusDTO
)
from app.cloudinary_config import *  # Initialize Cloudinary configuration

# Configure logging
logger = logging.getLogger(__name__)

# Create the FastAPI application
app = FastAPI(
    title="SDXL Style Transfer Service",
    description="Microservice for AI-powered artistic style transfer using Stable Diffusion XL with Cloudinary integration",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Global variables for connections
rabbitmq_connection: Optional[AbstractRobustConnection] = None
http_client: Optional[httpx.AsyncClient] = None

@app.on_event("startup")
async def startup_event():
    """Initialize connections and start the RabbitMQ consumer on application startup."""
    global http_client
    
    try:
        # Validate configuration
        validate_config()
        
        # Create HTTP client for callbacks
        http_client = httpx.AsyncClient(timeout=60.0)  # Longer timeout for style transfer
        
        # Start RabbitMQ consumer
        asyncio.create_task(start_rabbitmq_consumer())
        
        # Log startup success
        device_info = get_device_info()
        logger.info("🎨 SDXL Style Transfer Service started successfully")
        logger.info(f"🎮 Running on: {device_info['device']}")
        logger.info(f"🎭 Available styles: {len(AVAILABLE_STYLES)}")
        
    except Exception as e:
        logger.error(f"❌ Failed to start the service: {e}")
        raise e

@app.on_event("shutdown")
async def shutdown_event():
    """Close connections on application shutdown."""
    global rabbitmq_connection, http_client
    
    logger.info("🔄 Shutting down SDXL style transfer service...")
    
    # Close HTTP client
    if http_client:
        await http_client.aclose()
        http_client = None
    
    # Close RabbitMQ connection
    if rabbitmq_connection:
        await rabbitmq_connection.close()
        rabbitmq_connection = None
    
    # Force reset system to clear cache
    force_reset_system()
    
    logger.info("✅ SDXL style transfer service shutdown completed")

@app.get("/", response_model=Dict[str, Any])
async def root():
    """Root endpoint with service information."""
    return {
        "service": "SDXL Style Transfer Service",
        "version": "2.0.0",
        "status": "running",
        "device": DEVICE,
        "model": SDXL_CONFIG["base_model"],
        "available_styles": len(AVAILABLE_STYLES),
        "endpoints": {
            "health": "/health",
            "styles": "/styles",
            "catalog": "/catalog",
            "system": "/system",
            "docs": "/docs"
        }
    }

@app.get("/health", response_model=Dict[str, Any])
async def health_check():
    """Comprehensive health check endpoint with system status."""
    try:
        # Check RabbitMQ connection status
        rabbitmq_status = "connected" if rabbitmq_connection and not rabbitmq_connection.is_closed else "disconnected"
        
        # Get system status
        system_status = get_system_status()
        device_info = get_device_info()
        
        # Determine overall health
        is_healthy = (
            rabbitmq_status == "connected" and
            system_status.get("pipeline_loaded", False)
        )
        
        return JSONResponse(
            content={
                "status": "healthy" if is_healthy else "degraded",
                "timestamp": system_status["timestamp"],
                "services": {
                    "rabbitmq": rabbitmq_status,
                    "cloudinary": "configured",
                    "sdxl_pipeline": "loaded" if system_status["pipeline_loaded"] else "not_loaded"
                },
                "system": {
                    **system_status,
                    "device_info": device_info
                },
                "performance": {
                    "active_jobs": system_status["active_jobs_count"],
                    "memory_optimizations": {
                        "attention_slicing": True,
                        "vae_slicing": True,
                        "torch_compile": True
                    }
                }
            },
            status_code=200 if is_healthy else 503
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            content={
                "status": "unhealthy", 
                "error": str(e),
                "timestamp": time.time()
            },
            status_code=503
        )

@app.get("/styles", response_model=Dict[str, Any])
async def get_available_styles():
    """Get list of available art styles with display names."""
    style_display_names = get_style_display_names()
    
    # Group styles by category
    categories = {
        "Cartoon & Animation": ["3D_Chibi", "American_Cartoon", "Ghibli", "Anime", "Disney", "Pixar"],
        "Traditional Art": ["Chinese_Ink", "Oil_Painting", "Watercolor", "Acrylic_Painting", "Charcoal_Drawing"],
        "Famous Artists": ["Van_Gogh", "Picasso", "Monet", "Da_Vinci", "Warhol", "Banksy"],
        "Modern Styles": ["Pop_Art", "Street_Art", "Graffiti", "Comic_Book", "Manga", "Concept_Art"],
        "Digital Art": ["Pixel", "Vector", "Low_Poly", "Cyberpunk", "Synthwave", "Neon"],
        "Textures & Materials": ["Clay_Toy", "Fabric", "Paper_Cutting", "Origami", "LEGO", "Glass_Art"],
        "Artistic Movements": ["Impressionist", "Cubist", "Surreal", "Abstract", "Minimalist", "Art_Nouveau"]
    }
    
    return {
        "total_styles": len(AVAILABLE_STYLES),
        "styles": AVAILABLE_STYLES,
        "display_names": style_display_names,
        "categories": categories,
        "popular_styles": ["Ghibli", "Van_Gogh", "Oil_Painting", "American_Cartoon", "Pixel"],
        "quality_levels": ["FREE", "PREMIUM"],
        "strength_range": [0.1, 1.0],
        "max_prompt_length": 500
    }

@app.get("/catalog", response_model=StyleCatalogDTO)
async def get_style_catalog():
    """Get complete style catalog with detailed metadata."""
    return StyleCatalogDTO.create_catalog()

@app.get("/system", response_model=SystemStatusDTO)
async def get_system_info():
    """Get detailed system information and status."""
    status = get_system_status()
    device_info = get_device_info()
    
    return SystemStatusDTO(
        activeJobsCount=status["active_jobs_count"],
        activeJobs=status["active_jobs"],
        pipelineLoaded=status["pipeline_loaded"],
        availableStyles=status["available_styles"],
        device=status["device"],
        modelConfig=status["model_config"],
        modelsDirectory=status["models_directory"],
        memoryInfo=device_info,
        timestamp=status["timestamp"]
    )

@app.post("/admin/reset")
async def admin_reset(background_tasks: BackgroundTasks):
    """Emergency reset endpoint for system recovery."""
    try:
        def reset_system():
            force_reset_system()
            logger.info("🔄 System reset completed via admin endpoint")
        
        background_tasks.add_task(reset_system)
        
        return {
            "message": "System reset initiated successfully",
            "timestamp": time.time(),
            "note": "Reset is running in background"
        }
    except Exception as e:
        logger.error(f"Reset failed: {e}")
        raise HTTPException(status_code=500, detail=f"Reset failed: {e}")

@app.post("/admin/clear-cache")
async def admin_clear_cache(background_tasks: BackgroundTasks):
    """Clear model cache to free memory."""
    try:
        def clear_model_cache():
            clear_cache()
            logger.info("🧹 Model cache cleared via admin endpoint")
        
        background_tasks.add_task(clear_model_cache)
        
        return {
            "message": "Cache clearing initiated successfully",
            "timestamp": time.time()
        }
    except Exception as e:
        logger.error(f"Cache clearing failed: {e}")
        raise HTTPException(status_code=500, detail=f"Cache clearing failed: {e}")

@app.get("/admin/jobs")
async def admin_get_active_jobs():
    """Get information about currently active jobs."""
    status = get_system_status()
    return {
        "active_jobs_count": status["active_jobs_count"],
        "active_jobs": status["active_jobs"],
        "timestamp": status["timestamp"]
    }

@app.post("/admin/jobs/clear")
async def admin_clear_jobs():
    """Clear active jobs list (emergency use only)."""
    try:
        clear_active_jobs()
        return {
            "message": "Active jobs list cleared successfully",
            "timestamp": time.time(),
            "warning": "This is an emergency operation. Use with caution."
        }
    except Exception as e:
        logger.error(f"Job clearing failed: {e}")
        raise HTTPException(status_code=500, detail=f"Job clearing failed: {e}")

async def send_status_update(job_id: str, status_update: JobStatusUpdateRequestDTO) -> bool:
    """
    Send a status update to the Spring Boot backend.
    
    Args:
        job_id: The ID of the job being processed
        status_update: The status update payload
    
    Returns:
        bool: True if the callback was successful, False otherwise
    """
    global http_client
    
    if not http_client:
        logger.error("HTTP client not initialized")
        return False
    
    callback_url = SPRING_BOOT_CALLBACK_URL_TEMPLATE.format(job_id=job_id)
    
    try:
        logger.info(f"📤 Sending {status_update.status} callback for job {job_id}")
        
        response = await http_client.post(
            callback_url,
            json=status_update.dict(exclude_none=True),
            timeout=30.0
        )
        
        if 200 <= response.status_code < 300:
            logger.info(f"✅ Callback successful for job {job_id}: {response.status_code}")
            return True
        else:
            logger.error(f"❌ Callback failed for job {job_id}: {response.status_code} - {response.text}")
            return False
            
    except httpx.RequestError as e:
        logger.error(f"🔗 Callback request error for job {job_id}: {e}")
        return False

MAX_RETRIES = 2  # Reduced retries for style transfer due to longer processing time

async def process_message(message: AbstractIncomingMessage) -> None:
    """
    Process a style transfer message from RabbitMQ with retry logic.
    
    Args:
        message: The incoming message from RabbitMQ
    """
    job_id = "unknown"
    retry_count = 0

    while retry_count <= MAX_RETRIES:
        try:
            # Parse the message body as JSON
            message_body = message.body.decode("utf-8")
            message_data = json.loads(message_body)

            # Validate the message structure using Pydantic
            job_dto = JobMessageDTO(**message_data)
            job_id = job_dto.jobId

            logger.info(f"🎨 Received SDXL style transfer job {job_id} (attempt {retry_count + 1})")
            logger.info(f"🖼️ Image URL: {job_dto.imageStoragePath}")
            logger.info(f"⚙️ Job config: {job_dto.jobConfig}")

            # Only process STYLE_TRANSFER job type
            if job_dto.jobType != JobType.STYLE_TRANSFER:
                logger.warning(f"🚫 Ignoring job {job_id} with unsupported type: {job_dto.jobType}")
                await message.ack()
                return

            # Check if we're at max concurrent jobs
            active_jobs = get_active_jobs_count()
            from app.config import PERFORMANCE_CONFIG
            max_concurrent = PERFORMANCE_CONFIG["max_concurrent_jobs"]
            
            if active_jobs >= max_concurrent:
                logger.warning(f"⏳ Max concurrent jobs ({max_concurrent}) reached, requeueing job {job_id}")
                await message.nack(requeue=True)
                return

            # Send processing status on first attempt, retrying on subsequent
            if retry_count == 0:
                status_update = JobStatusUpdateRequestDTO(status=JobStatus.PROCESSING)
            else:
                status_update = JobStatusUpdateRequestDTO(
                    status=JobStatus.RETRYING,
                    processingParams={
                        "retryCount": retry_count,
                        "maxRetries": MAX_RETRIES,
                        "device": DEVICE
                    }
                )
            await send_status_update(job_id, status_update)
            
            # Perform SDXL style transfer
            processed_image_url, processing_params = await perform_style_transfer(
                job_id,
                job_dto.imageStoragePath,
                job_dto.jobConfig or {}
            )

            # Send COMPLETED status update
            completed_status = JobStatusUpdateRequestDTO(
                status=JobStatus.COMPLETED,
                processedStoragePath=processed_image_url,
                processingParams=processing_params
            )
            await send_status_update(job_id, completed_status)

            # Acknowledge the message on successful processing
            await message.ack()
            logger.info(f"✅ SDXL style transfer job {job_id} completed successfully on attempt {retry_count + 1}")
            return  # Exit after success

        except json.JSONDecodeError as e:
            logger.error(f"🔍 Failed to parse message as JSON: {e}")
            await message.nack(requeue=False)
            return  # Don't retry for invalid JSON
        
        except Exception as e:
            retry_count += 1
            logger.error(f"❌ Error processing SDXL style transfer job {job_id} on attempt {retry_count}: {e}")
            logger.error(traceback.format_exc())

            if retry_count > MAX_RETRIES:
                # Send FAILED status and don't retry anymore
                failed_status = JobStatusUpdateRequestDTO(
                    status=JobStatus.FAILED,
                    errorMessage=f"SDXL style transfer failed after {MAX_RETRIES} attempts: {str(e)}",
                    processingParams={
                        "finalAttempt": retry_count,
                        "device": DEVICE,
                        "error_type": type(e).__name__
                    }
                )
                await send_status_update(job_id, failed_status)
                await message.nack(requeue=False)
                return
            else:
                # Send RETRYING status and wait before retrying
                retry_status = JobStatusUpdateRequestDTO(
                    status=JobStatus.RETRYING,
                    processingParams={
                        "retryCount": retry_count,
                        "maxRetries": MAX_RETRIES,
                        "device": DEVICE,
                        "nextRetryIn": "10 seconds"
                    },
                    errorMessage=str(e)
                )
                await send_status_update(job_id, retry_status)
                await asyncio.sleep(10)  # Wait longer between retries for style transfer

    # Fallback nack without requeue in case of unexpected flow
    await message.nack(requeue=False)

async def start_rabbitmq_consumer() -> None:
    """
    Connect to RabbitMQ and start consuming messages.
    Implements retry logic for connection failures.
    """
    global rabbitmq_connection
    
    retry_delay = 5  # seconds
    max_retries = 12  # 1 minute at 5 second intervals
    retries = 0
    
    while retries < max_retries:
        try:
            # Connect to RabbitMQ
            logger.info(f"🔗 Connecting to RabbitMQ at {RABBITMQ_URL}")
            
            rabbitmq_connection = await aio_pika.connect_robust(RABBITMQ_URL)
            
            # Create a channel
            channel = await rabbitmq_connection.channel()
            
            # Set QoS to process limited messages at a time for style transfer
            from app.config import PERFORMANCE_CONFIG
            prefetch_count = PERFORMANCE_CONFIG["max_concurrent_jobs"]
            await channel.set_qos(prefetch_count=prefetch_count)
            
            # Declare the exchange
            exchange = await channel.declare_exchange(
                CONSUME_EXCHANGE_NAME,
                aio_pika.ExchangeType.TOPIC,
                durable=True
            )
            
            # Declare the queue
            queue = await channel.declare_queue(
                CONSUME_QUEUE_NAME,
                durable=True
            )
            
            # Bind the queue to the exchange using the routing key
            await queue.bind(
                exchange=exchange,
                routing_key=CONSUME_ROUTING_KEY
            )
            
            logger.info(f"🎨 Connected to RabbitMQ, consuming from queue: {CONSUME_QUEUE_NAME}")
            logger.info(f"🚀 SDXL style transfer service ready on {DEVICE}")
            logger.info(f"⚙️ Max concurrent jobs: {prefetch_count}")
            
            # Start consuming messages
            await queue.consume(process_message)
            
            # Keep the connection alive
            while True:
                await asyncio.sleep(1)
                if rabbitmq_connection.is_closed:
                    break
            
            logger.info("🔗 RabbitMQ connection closed")
            
        except aio_pika.exceptions.AMQPError as e:
            logger.error(f"🔗 RabbitMQ connection error: {e}")
            
            retries += 1
            
            if retries < max_retries:
                logger.info(f"🔄 Retrying in {retry_delay} seconds... (Attempt {retries}/{max_retries})")
                await asyncio.sleep(retry_delay)
            else:
                logger.error(f"💥 Failed to connect to RabbitMQ after {max_retries} attempts")
                break
                
        except Exception as e:
            logger.error(f"💥 Unexpected error in RabbitMQ consumer: {e}")
            logger.error(traceback.format_exc())
            break

# Add time import at the top
import time

if __name__ == "__main__":
    import uvicorn
    
    # Log startup information
    logger.info("🚀 Starting SDXL Style Transfer Service")
    logger.info(f"🎮 Device: {DEVICE}")
    logger.info(f"🏠 Host: {SERVICE_HOST}:{SERVICE_PORT}")
    
    uvicorn.run(
        app, 
        host=SERVICE_HOST, 
        port=SERVICE_PORT,
        log_level=os.getenv("LOG_LEVEL", "info").lower(),
        access_log=True
    )