"""
Data Transfer Objects (DTOs) for the upscaling service.
Defines Pydantic models for incoming and outgoing data validation.
"""

from enum import Enum
from typing import Dict, Optional, Any
from pydantic import BaseModel, Field

class JobType(str, Enum):
    """Job types supported by the image processing system."""
    BG_REMOVAL = "BG_REMOVAL"
    UPSCALE = "UPSCALE"
    ENLARGE = "ENLARGE"

class JobStatus(str, Enum):
    """Status values for job processing."""
    RECEIVED = "RECEIVED"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class UpscaleQuality(str, Enum):
    """Upscaling quality levels."""
    FREE = "FREE"  # Lower quality, fast processing
    PREMIUM = "PREMIUM"  # Higher quality, slower processing

class JobMessageDTO(BaseModel):
    """
    DTO for job messages received from RabbitMQ.
    Represents the structure of messages sent by the Spring Boot backend.
    """
    jobId: str
    originalImageId: str
    imageStoragePath: str
    jobType: JobType
    jobConfig: Optional[Dict[str, Any]] = Field(default_factory=dict)

class JobStatusUpdateRequestDTO(BaseModel):
    """
    DTO for sending job status updates back to the Spring Boot backend.
    """
    status: JobStatus
    processedStoragePath: Optional[str] = None
    processingParams: Optional[Dict[str, Any]] = None
    errorMessage: Optional[str] = None

    class Config:
        use_enum_values = True