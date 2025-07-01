"""
Data Transfer Objects (DTOs) for the image generation service.
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
    IMAGE_GENERATION = "IMAGE_GENERATION"

class JobStatus(str, Enum):
    """Status values for job processing."""
    RECEIVED = "RECEIVED"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    RETRYING = "RETRYING"

class AspectRatio(str, Enum):
    """Supported aspect ratios for image generation."""
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

class ImageGenerationQuality(str, Enum):
    """Image generation quality levels."""
    FREE = "FREE"  # Basic image generation
    PREMIUM = "PREMIUM"  # Advanced image generation with higher quality

class JobMessageDTO(BaseModel):
    """
    DTO for job messages received from RabbitMQ.
    Represents the structure of messages sent by the Spring Boot backend.
    """
    jobId: str
    originalImageId: str
    imageStoragePath: Optional[str] = None
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

class ImageGenerationConfigDTO(BaseModel):
    """
    DTO for image generation configuration parameters.
    Validates the job configuration for image generation operations.
    """
    prompt: str = Field(description="Text prompt for image generation")
    aspectRatio: AspectRatio = Field(default=AspectRatio.SQUARE, description="Target aspect ratio")
    quality: ImageGenerationQuality = Field(default=ImageGenerationQuality.FREE, description="Quality level for generation")
    negativePrompt: Optional[str] = Field(default=None, description="Negative prompt to avoid certain elements")
    steps: int = Field(default=20, ge=10, le=50, description="Number of inference steps")
    guidanceScale: float = Field(default=7.5, ge=1.0, le=20.0, description="Guidance scale for generation")
    
    def validate_prompt(self) -> bool:
        """
        Validate that the prompt is suitable for image generation.
        """
        if not self.prompt or len(self.prompt.strip()) < 3:
            return False
        return True

class ProcessingResultDTO(BaseModel):
    """
    DTO for processing results returned by the image generation function.
    """
    processedImageUrl: str
    thumbnailUrl: str
    outputSize: str
    aspectRatio: AspectRatio
    prompt: str
    qualityLevel: str
    processingTimeSeconds: float
    isPremium: bool
    steps: int
    guidanceScale: float