"""
Main application module for the image conversion service.
Implements FastAPI app, RabbitMQ consumer, and job processing logic with Cloudinary integration.
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
    SERVICE_PORT
)
from app.processing import perform_image_conversion, ImageProcessingError, get_system_status, get_supported_formats
from app.dto import JobMessageDTO, JobStatusUpdateRequestDTO, JobStatus
from app.cloudinary_config import *  # Initialize Cloudinary configuration

# Configure logging
logger = logging.getLogger(__name__)

# Create the FastAPI application
app = FastAPI(
    title="Image Conversion Service",
    description="Microservice for image format conversion and compression with Cloudinary integration",
    version="1.0.0",
)

# Global variables for the RabbitMQ connection and HTTP client
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
        
        logger.info("Image Conversion Service with Cloudinary started successfully")
    except Exception as e:
        logger.error(f"Failed to start the service: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """Close connections on application shutdown."""
    global rabbitmq_connection, http_client
    
    logger.info("Shutting down the service...")
    
    # Close HTTP client
    if http_client:
        await http_client.aclose()
        http_client = None
    
    # Close RabbitMQ connection
    if rabbitmq_connection:
        await rabbitmq_connection.close()
        rabbitmq_connection = None
    
    logger.info("Service shutdown completed")

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    # Check RabbitMQ connection status
    rabbitmq_status = "connected" if rabbitmq_connection and not rabbitmq_connection.is_closed else "disconnected"
    
    return JSONResponse(
        content={
            "status": "healthy" if rabbitmq_status == "connected" else "degraded",
            "services": {
                "rabbitmq": rabbitmq_status,
                "cloudinary": "configured"
            },
            "system_info": get_system_status()
        },
        status_code=200 if rabbitmq_status == "connected" else 503
    )

@app.get("/formats")
async def supported_formats():
    """Returns information about supported image formats."""
    return JSONResponse(content=get_supported_formats())

@app.get("/status")
async def system_status():
    """Returns detailed system status."""
    return JSONResponse(content=get_system_status())

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
        logger.info(f"Sending {status_update.status} callback for job {job_id} to {callback_url}")
        
        response = await http_client.post(
            callback_url,
            json=status_update.dict(exclude_none=True)
        )
        
        # Log the actual payload being sent
        logger.info(f"Callback payload: {status_update.dict(exclude_none=True)}")
        
        if response.status_code >= 200 and response.status_code < 300:
            logger.info(f"Callback successful for job {job_id}: {response.status_code}")
            return True
        else:
            logger.error(f"Callback failed for job {job_id}: {response.status_code} - {response.text}")
            return False
            
    except httpx.RequestError as e:
        logger.error(f"Callback request error for job {job_id}: {e}")
        return False

MAX_RETRIES = 3  # Maximum number of retry attempts

async def process_message(message: AbstractIncomingMessage) -> None:
    """
    Process a message from RabbitMQ with retry logic and status updates.
    
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

            logger.info(f"Received job {job_id} of type {job_dto.jobType} (attempt {retry_count + 1})")
            logger.info(f"Image URL: {job_dto.imageStoragePath}")

            # Only process IMAGE_CONVERSION job type
            if job_dto.jobType != "IMAGE_CONVERSION":
                logger.warning(f"Ignoring job {job_id} with unsupported type: {job_dto.jobType}")
                await message.ack()
                return

            # Send status update: PROCESSING on first attempt, RETRYING on subsequent attempts
            if retry_count == 0:
                status_update = JobStatusUpdateRequestDTO(status=JobStatus.PROCESSING)
            else:
                status_update = JobStatusUpdateRequestDTO(
                    status=JobStatus.RETRYING,
                    processingParams={"retryCount": retry_count}
                )
            await send_status_update(job_id, status_update)

            # Perform image conversion with Cloudinary integration
            processed_image_url, processing_params = await perform_image_conversion(
                job_id,
                job_dto.imageStoragePath,  # This is a Cloudinary URL
                job_dto.jobConfig or {}
            )

            # Send COMPLETED status update with Cloudinary URL
            completed_status = JobStatusUpdateRequestDTO(
                status=JobStatus.COMPLETED,
                processedStoragePath=processed_image_url,
                processingParams=processing_params
            )
            await send_status_update(job_id, completed_status)

            # Acknowledge the message on successful processing
            await message.ack()
            logger.info(f"Job {job_id} completed successfully on attempt {retry_count + 1}")
            return  # Exit after success

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse message as JSON: {e}")
            await message.nack(requeue=False)
            return  # Don't retry if JSON is invalid

        except Exception as e:
            retry_count += 1
            logger.error(f"Error processing job {job_id} on attempt {retry_count}: {e}")
            logger.error(traceback.format_exc())

            if retry_count > MAX_RETRIES:
                # Send FAILED status and don't retry anymore
                failed_status = JobStatusUpdateRequestDTO(
                    status=JobStatus.FAILED,
                    errorMessage=str(e)
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
                await asyncio.sleep(2)  # Optional wait before retry

    # In extreme case, nack without requeue
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
            logger.info(f"Connecting to RabbitMQ at {RABBITMQ_URL}")
            
            rabbitmq_connection = await aio_pika.connect_robust(RABBITMQ_URL)
            
            # Create a channel
            channel = await rabbitmq_connection.channel()
            
            # Set QoS to process one message at a time
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
            
            logger.info(f"Connected to RabbitMQ, consuming from queue: {CONSUME_QUEUE_NAME}")
            logger.info("Cloudinary integration enabled for image processing")
            
            # Start consuming messages
            await queue.consume(process_message)
            
            # Keep the connection alive
            while True:
                await asyncio.sleep(1)
                if rabbitmq_connection.is_closed:
                    break
            
            logger.info("RabbitMQ connection closed")
            
        except aio_pika.exceptions.AMQPError as e:
            logger.error(f"RabbitMQ connection error: {e}")
            
            retries += 1
            
            if retries < max_retries:
                logger.info(f"Retrying in {retry_delay} seconds... (Attempt {retries}/{max_retries})")
                await asyncio.sleep(retry_delay)
            else:
                logger.error(f"Failed to connect to RabbitMQ after {max_retries} attempts")
                break
                
        except Exception as e:
            logger.error(f"Unexpected error in RabbitMQ consumer: {e}")
            logger.error(traceback.format_exc())
            break