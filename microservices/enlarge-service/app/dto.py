"""
Data Transfer Objects (DTOs) for the enlarge service.
Defines Pydantic models for incoming and outgoing data validation.
"""

from enum import Enum
from typing import Dict, Optional, Any, Literal
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
    RETRYING = "RETRYING"

class AspectRatio(str, Enum):
    """Supported aspect ratios for image enlargement."""
    PORTRAIT = "portrait"
    LANDSCAPE = "landscape"
    SQUARE = "square"

class PositionPortrait(str, Enum):
    """Position options for portrait aspect ratio."""
    CENTER = "center"
    UP = "up"
    DOWN = "down"

class PositionLandscape(str, Enum):
    """Position options for landscape aspect ratio."""
    CENTER = "center"
    LEFT = "left"
    RIGHT = "right"

class PositionSquare(str, Enum):
    """Position options for square aspect ratio."""
    CENTER = "center"
    TOP_LEFT = "top-left"
    TOP_RIGHT = "top-right"
    BOTTOM_LEFT = "bottom-left"
    BOTTOM_RIGHT = "bottom-right"

class EnlargeQuality(str, Enum):
    """Enlargement quality levels."""
    FREE = "FREE"  # Basic enlargement with simple content fill
    PREMIUM = "PREMIUM"  # Advanced enlargement with better content-aware fill

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

class EnlargeConfigDTO(BaseModel):
    """
    DTO for enlargement configuration parameters.
    Validates the job configuration for enlarge operations.
    """
    aspectRatio: AspectRatio = Field(default=AspectRatio.SQUARE, description="Target aspect ratio")
    position: str = Field(default="center", description="Position of original image in new canvas")
    quality: EnlargeQuality = Field(default=EnlargeQuality.FREE, description="Quality level for enlargement")
    
    def validate_position_for_aspect_ratio(self) -> bool:
        """
        Validate that the position is valid for the selected aspect ratio.
        """
        if self.aspectRatio == AspectRatio.PORTRAIT:
            return self.position in ["center", "up", "down"]
        elif self.aspectRatio == AspectRatio.LANDSCAPE:
            return self.position in ["center", "left", "right"]
        elif self.aspectRatio == AspectRatio.SQUARE:
            return self.position in ["center", "top-left", "top-right", "bottom-left", "bottom-right"]
        return False

class ProcessingResultDTO(BaseModel):
    """
    DTO for processing results returned by the enlargement function.
    """
    processedImageUrl: str
    thumbnailUrl: str
    originalSize: str
    outputSize: str
    aspectRatio: AspectRatio
    position: str
    qualityLevel: str
    areaIncreaseFactor: float
    processingTimeSeconds: float
    isPremium: bool