"""
Main application module for the object removal service.
Implements FastAPI app, RabbitMQ consumer, and job processing logic.
Handles object removal from images using AI models.
"""

import json
import asyncio
import logging
import traceback
from typing import Dict, Any, Optional

import aio_pika
import httpx
from fastapi import FastAPI
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
from app.processing import perform_object_removal, ImageProcessingError
from app.dto import JobMessageDTO, JobStatusUpdateRequestDTO, JobStatus, ObjectRemovalConfigDTO
from app.cloudinary_config import *  # Initialize Cloudinary configuration

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Image Object Removal Service",
    description="Microservice for AI-powered object removal from images",
    version="0.1.0",
)

rabbitmq_connection: Optional[AbstractRobustConnection] = None
http_client: Optional[httpx.AsyncClient] = None

@app.on_event("startup")
async def startup_event():
    global http_client
    try:
        validate_config()
        http_client = httpx.AsyncClient(timeout=30.0)
        asyncio.create_task(start_rabbitmq_consumer())
        logger.info("Object Removal Service started successfully")
    except Exception as e:
        logger.error(f"Failed to start the service: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    global rabbitmq_connection, http_client
    logger.info("Shutting down the service...")
    if http_client:
        await http_client.aclose()
        http_client = None
    if rabbitmq_connection:
        await rabbitmq_connection.close()
        rabbitmq_connection = None
    logger.info("Service shutdown completed")

@app.get("/health")
async def health_check():
    rabbitmq_status = "connected" if rabbitmq_connection and not rabbitmq_connection.is_closed else "disconnected"
    return JSONResponse(
        content={
            "status": "healthy" if rabbitmq_status == "connected" else "degraded",
            "services": {
                "rabbitmq": rabbitmq_status,
                "object_removal": "available",
            }
        },
        status_code=200 if rabbitmq_status == "connected" else 503
    )

async def send_status_update(job_id: str, status_update: JobStatusUpdateRequestDTO) -> bool:
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
        logger.info(f"Callback payload: {status_update.dict(exclude_none=True)}")
        if 200 <= response.status_code < 300:
            logger.info(f"Callback successful for job {job_id}: {response.status_code}")
            return True
        else:
            logger.error(f"Callback failed for job {job_id}: {response.status_code} - {response.text}")
            return False
    except httpx.RequestError as e:
        logger.error(f"Callback request error for job {job_id}: {e}")
        return False

MAX_RETRIES = 3

async def process_message(message: AbstractIncomingMessage) -> None:
    job_id = "unknown"
    retry_count = 0

    while retry_count <= MAX_RETRIES:
        try:
            
            
            message_body = message.body.decode("utf-8")
            message_data = json.loads(message_body)
            
            # 🔍 DEBUG: Log del mensaje crudo
            logger.info(f"Raw message body: {message_body}")
            logger.info(f"Parsed message dict: {message_data}")
            
            job_dto = JobMessageDTO(**message_data)
            job_id = job_dto.jobId

            # 🔍 DEBUG: Log del DTO parseado
            logger.info(f"Job DTO received: {job_dto}")
            logger.info(f"Job DTO dict: {job_dto.dict()}")
            logger.info(f"mask_coordinates value: {job_dto.mask_coordinates}")
            logger.info(f"mask_coordinates type: {type(job_dto.mask_coordinates)}")
            logger.info(f"All DTO fields: {list(job_dto.__fields__.keys())}")

            logger.info(f"Received job {job_id} of type {job_dto.jobType} (attempt {retry_count + 1})")
            logger.info(f"Image URL: {job_dto.imageStoragePath}")
            logger.info(f"Mask URL: {getattr(job_dto, 'maskStoragePath', None)}")

            # 🔍 Buscar coordenadas en diferentes lugares
            mask_coords = None
            
            # Opción 1: Campo directo
            if hasattr(job_dto, 'mask_coordinates') and job_dto.mask_coordinates:
                mask_coords = job_dto.mask_coordinates
                logger.info("✅ Found mask_coordinates in direct field")
            
            # Opción 2: En jobConfig
            elif job_dto.jobConfig and 'mask_coordinates' in job_dto.jobConfig:
                mask_coords = job_dto.jobConfig['mask_coordinates']
                logger.info("✅ Found mask_coordinates in jobConfig")
            
            # Opción 3: Otros nombres posibles
            elif hasattr(job_dto, 'maskCoordinates') and getattr(job_dto, 'maskCoordinates'):
                mask_coords = getattr(job_dto, 'maskCoordinates')
                logger.info("✅ Found maskCoordinates (camelCase)")
            
            # Opción 4: En message_data crudo
            elif 'mask_coordinates' in message_data:
                mask_coords = message_data['mask_coordinates']
                logger.info("✅ Found mask_coordinates in raw message_data")
            
            elif 'maskCoordinates' in message_data:
                mask_coords = message_data['maskCoordinates']
                logger.info("✅ Found maskCoordinates in raw message_data")
            
            else:
                logger.warning("❌ No mask coordinates found anywhere!")
                # Buscar campos que contengan 'coord' o 'mask'
                for key in message_data.keys():
                    if 'coord' in key.lower() or 'mask' in key.lower():
                        logger.info(f"🔍 Found potential coordinate field: {key} = {message_data[key]}")

            logger.info(f"Final mask_coords to use: {mask_coords}")
            message_body = message.body.decode("utf-8")
            message_data = json.loads(message_body)
            job_dto = JobMessageDTO(**message_data)
            job_id = job_dto.jobId

            logger.info(f"Received job {job_id} of type {job_dto.jobType} (attempt {retry_count + 1})")
            logger.info(f"Image URL: {job_dto.imageStoragePath}")
            logger.info(f"Mask URL: {getattr(job_dto, 'maskStoragePath', None)}")

            if job_dto.jobType != "OBJECT_REMOVAL":
                logger.warning(f"Ignoring job {job_id} with unsupported type: {job_dto.jobType}")
                await message.ack()
                return

            if retry_count == 0:
                status_update = JobStatusUpdateRequestDTO(status=JobStatus.PROCESSING)
            else:
                status_update = JobStatusUpdateRequestDTO(
                    status=JobStatus.RETRYING,
                    processingParams={"retryCount": retry_count}
                )
            await send_status_update(job_id, status_update)

            # parse jobConfig as ObjectRemovalConfig, if present
            job_config = job_dto.jobConfig or {}
            job_config['coordinates'] = [mask_coords]  

            processed_image_url, processing_params = await perform_object_removal(
                job_id=job_id,
                image_url=job_dto.imageStoragePath,
                config=job_config
            )

            completed_status = JobStatusUpdateRequestDTO(
                status=JobStatus.COMPLETED,
                processedStoragePath=processed_image_url,
                processingParams=processing_params
            )
            await send_status_update(job_id, completed_status)

            await message.ack()
            logger.info(f"Job {job_id} completed successfully on attempt {retry_count + 1}")
            return

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse message as JSON: {e}")
            await message.nack(requeue=False)
            return
        
        except Exception as e:
            retry_count += 1
            logger.error(f"Error processing job {job_id} on attempt {retry_count}: {e}")
            logger.error(traceback.format_exc())

            if retry_count > MAX_RETRIES:
                failed_status = JobStatusUpdateRequestDTO(
                    status=JobStatus.FAILED,
                    errorMessage=str(e)
                )
                await send_status_update(job_id, failed_status)
                await message.nack(requeue=False)
                return
            else:
                retry_status = JobStatusUpdateRequestDTO(
                    status=JobStatus.RETRYING,
                    processingParams={"retryCount": retry_count},
                    errorMessage=str(e)
                )
                await send_status_update(job_id, retry_status)
                await asyncio.sleep(2)

    await message.nack(requeue=False)

async def start_rabbitmq_consumer() -> None:
    global rabbitmq_connection

    retry_delay = 5
    max_retries = 12
    retries = 0

    while retries < max_retries:
        try:
            logger.info(f"Connecting to RabbitMQ at {RABBITMQ_URL}")
            rabbitmq_connection = await aio_pika.connect_robust(RABBITMQ_URL)
            channel = await rabbitmq_connection.channel()
            await channel.set_qos(prefetch_count=1)
            exchange = await channel.declare_exchange(
                CONSUME_EXCHANGE_NAME,
                aio_pika.ExchangeType.TOPIC,
                durable=True
            )
            queue = await channel.declare_queue(
                CONSUME_QUEUE_NAME,
                durable=True
            )
            await queue.bind(exchange=exchange, routing_key=CONSUME_ROUTING_KEY)
            logger.info(f"Connected to RabbitMQ, consuming from queue: {CONSUME_QUEUE_NAME}")
            await queue.consume(process_message)

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
