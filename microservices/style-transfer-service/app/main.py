"""
Main application module for the style transfer service.
Implements FastAPI app, RabbitMQ consumer, and job processing logic with OmniConsistency integration.
"""

import json
import asyncio
import logging
import traceback
from typing import Dict, Any, Optional

import aio_pika
import httpx
from fastapi import FastAPI, HTTPException
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
    AVAILABLE_STYLES
)
from app.processing import perform_style_transfer, get_system_status, force_reset_system
from app.dto import JobMessageDTO, JobStatusUpdateRequestDTO, JobStatus, JobType
from app.cloudinary_config import *  # Initialize Cloudinary configuration

# Configure logging
logger = logging.getLogger(__name__)

# Create the FastAPI application
app = FastAPI(
    title="Style Transfer Service",
    description="Microservice for AI-powered artistic style transfer using OmniConsistency with Cloudinary integration",
    version="1.0.0",
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
        http_client = httpx.AsyncClient(timeout=30.0)
        
        # Start RabbitMQ consumer
        asyncio.create_task(start_rabbitmq_consumer())
        
        logger.info("🎨 Style Transfer Service with OmniConsistency started successfully")
        logger.info(f"📋 Available styles: {len(AVAILABLE_STYLES)} styles")
        
    except Exception as e:
        logger.error(f"❌ Failed to start the service: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """Close connections on application shutdown."""
    global rabbitmq_connection, http_client
    
    logger.info("🔄 Shutting down style transfer service...")
    
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
    
    logger.info("✅ Style transfer service shutdown completed")

@app.get("/health")
async def health_check():
    """Health check endpoint with system status."""
    try:
        # Check RabbitMQ connection status
        rabbitmq_status = "connected" if rabbitmq_connection and not rabbitmq_connection.is_closed else "disconnected"
        
        # Get system status
        system_status = get_system_status()
        
        return JSONResponse(
            content={
                "status": "healthy" if rabbitmq_status == "connected" else "degraded",
                "services": {
                    "rabbitmq": rabbitmq_status,
                    "cloudinary": "configured",
                    "pipeline": "loaded" if system_status["pipeline_loaded"] else "not_loaded"
                },
                "system": system_status
            },
            status_code=200 if rabbitmq_status == "connected" else 503
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            content={"status": "unhealthy", "error": str(e)},
            status_code=503
        )

@app.get("/styles")
async def get_available_styles():
    """Get list of available art styles."""
    return {
        "styles": AVAILABLE_STYLES,
        "count": len(AVAILABLE_STYLES),
        "examples": {
            style: f"Example prompt for {style.replace('_', ' ')} style"
            for style in AVAILABLE_STYLES
        }
    }

@app.post("/admin/reset")
async def admin_reset():
    """Emergency reset endpoint for system recovery."""
    try:
        force_reset_system()
        return {"message": "System reset completed successfully"}
    except Exception as e:
        logger.error(f"Reset failed: {e}")
        raise HTTPException(status_code=500, detail=f"Reset failed: {e}")

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
            json=status_update.dict(exclude_none=True)
        )
        
        logger.info(f"📦 Callback payload: {status_update.dict(exclude_none=True)}")
        
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

            logger.info(f"🎨 Received style transfer job {job_id} (attempt {retry_count + 1})")
            logger.info(f"🖼️ Image URL: {job_dto.imageStoragePath}")
            logger.info(f"⚙️ Job config: {job_dto.jobConfig}")

            # Only process STYLE_TRANSFER job type
            if job_dto.jobType != JobType.STYLE_TRANSFER:
                logger.warning(f"🚫 Ignoring job {job_id} with unsupported type: {job_dto.jobType}")
                await message.ack()
                return

            # Send processing status on first attempt, retrying on subsequent
            if retry_count == 0:
                status_update = JobStatusUpdateRequestDTO(status=JobStatus.PROCESSING)
            else:
                status_update = JobStatusUpdateRequestDTO(
                    status=JobStatus.RETRYING,
                    processingParams={"retryCount": retry_count}
                )
            await send_status_update(job_id, status_update)
            
            # Perform style transfer
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
            logger.info(f"✅ Style transfer job {job_id} completed successfully on attempt {retry_count + 1}")
            return  # Exit after success

        except json.JSONDecodeError as e:
            logger.error(f"🔍 Failed to parse message as JSON: {e}")
            await message.nack(requeue=False)
            return  # Don't retry for invalid JSON
        
        except Exception as e:
            retry_count += 1
            logger.error(f"❌ Error processing style transfer job {job_id} on attempt {retry_count}: {e}")
            logger.error(traceback.format_exc())

            if retry_count > MAX_RETRIES:
                # Send FAILED status and don't retry anymore
                failed_status = JobStatusUpdateRequestDTO(
                    status=JobStatus.FAILED,
                    errorMessage=f"Style transfer failed after {MAX_RETRIES} attempts: {str(e)}"
                )
                await send_status_update(job_id, failed_status)
                await message.nack(requeue=False)
                return
            else:
                # Send RETRYING status and wait before retrying
                retry_status = JobStatusUpdateRequestDTO(
                    status=JobStatus.RETRYING,
                    processingParams={"retryCount": retry_count},
                    errorMessage=str(e)
                )
                await send_status_update(job_id, retry_status)
                await asyncio.sleep(5)  # Wait longer between retries for style transfer

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
            
            # Set QoS to process one message at a time for style transfer
            await channel.set_qos(prefetch_count=1)
            
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
            logger.info("🚀 OmniConsistency style transfer service ready")
            
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