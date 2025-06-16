"""
Data Transfer Objects (DTOs) for the object removal service.
Defines Pydantic models for incoming and outgoing data validation.
"""

from enum import Enum
from typing import Dict, Optional, Any, Union
from pydantic import BaseModel, Field


class JobType(str, Enum):
    """Job types supported by the image processing system."""
    BG_REMOVAL = "BG_REMOVAL"
    UPSCALE = "UPSCALE"
    ENLARGE = "ENLARGE"
    OBJECT_REMOVAL = "OBJECT_REMOVAL"


class JobStatus(str, Enum):
    """Status values for job processing."""
    RECEIVED = "RECEIVED"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    RETRYING = "RETRYING"


class ObjectRemovalMethod(str, Enum):
    """Methods supported for object removal."""
    MASK = "MASK"
    INPAINT = "INPAINT"
    AUTO_DETECT = "AUTO_DETECT"
    BOUNDING_BOX = "BOUNDING_BOX"


class JobMessageDTO(BaseModel):
    """
    DTO for job messages received from RabbitMQ.
    Represents the structure of messages sent by the backend.
    """
    jobId: str
    originalImageId: Optional[str] = None
    imageStoragePath: Optional[str] = None
    mask_coordinates: Optional[Dict[str, Union[int, float]]] = None
    jobType: Optional[JobType] = None
    jobConfig: Optional[Dict[str, Any]] = Field(default_factory=dict)
    quality: Optional[str] = None

    def __init__(self, **data):
        super().__init__(**data)
        # Extraer coordenadas del jobConfig si no están en mask_coordinates
        if not self.mask_coordinates and self.jobConfig and 'coordinates' in self.jobConfig:
            self.mask_coordinates = self.jobConfig['coordinates']


class ObjectRemovalConfigDTO(BaseModel):
    """
    DTO for object removal configuration parameters.
    Validates the job configuration for object removal operations.
    """
    method: ObjectRemovalMethod = Field(
        default=ObjectRemovalMethod.MASK,
        description="Method used for object removal"
    )
    maskStoragePath: Optional[str] = Field(
        default=None,
        description="Storage path for the mask image if method is MASK"
    )
    inpaintRadius: Optional[int] = Field(
        default=5,
        ge=1,
        le=50,
        description="Radius parameter for inpaint method"
    )
    extraParams: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Additional parameters for future use"
    )


class JobStatusUpdateRequestDTO(BaseModel):
    """
    DTO for sending job status updates back to the backend.
    """
    status: JobStatus
    processedStoragePath: Optional[str] = None
    processingParams: Optional[Dict[str, Any]] = None
    errorMessage: Optional[str] = None

    class Config:
        use_enum_values = True


class ObjectRemovalResultDTO(BaseModel):
    """
    DTO for processing results returned by the object removal function.
    """
    processedImageUrl: str
    originalImageId: str
    methodUsed: ObjectRemovalMethod
    processingTimeSeconds: float
    processingParams: Optional[Dict[str, Any]] = None