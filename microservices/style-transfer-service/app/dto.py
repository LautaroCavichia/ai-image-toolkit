"""
Data Transfer Objects (DTOs) for the style transfer service.
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
    STYLE_TRANSFER = "STYLE_TRANSFER"

class JobStatus(str, Enum):
    """Status values for job processing."""
    RECEIVED = "RECEIVED"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    RETRYING = "RETRYING"

class StyleType(str, Enum):
    """Available art styles for image style transfer."""
    THREE_D_CHIBI = "3D_Chibi"
    AMERICAN_CARTOON = "American_Cartoon"
    CHINESE_INK = "Chinese_Ink"
    CLAY_TOY = "Clay_Toy"
    FABRIC = "Fabric"
    GHIBLI = "Ghibli"
    IRASUTOYA = "Irasutoya"
    JOJO = "Jojo"
    LEGO = "LEGO"
    LINE = "Line"
    MACARON = "Macaron"
    OIL_PAINTING = "Oil_Painting"
    ORIGAMI = "Origami"
    PAPER_CUTTING = "Paper_Cutting"
    PICASSO = "Picasso"
    PIXEL = "Pixel"
    POLY = "Poly"
    POP_ART = "Pop_Art"
    RICK_MORTY = "Rick_Morty"
    SNOOPY = "Snoopy"
    VAN_GOGH = "Van_Gogh"
    VECTOR = "Vector"

class StyleQuality(str, Enum):
    """Quality levels for style transfer."""
    FREE = "FREE"  # Standard quality, faster processing
    PREMIUM = "PREMIUM"  # Higher quality, more inference steps

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

class StyleTransferConfigDTO(BaseModel):
    """
    DTO for style transfer configuration parameters.
    Validates the job configuration for style transfer operations.
    """
    style: StyleType = Field(description="Target art style")
    quality: StyleQuality = Field(default=StyleQuality.FREE, description="Quality level for style transfer")
    prompt: Optional[str] = Field(default=None, description="Optional text prompt to guide the style transfer")
    strength: float = Field(default=1.0, ge=0.1, le=2.0, description="Style transfer strength (0.1-2.0)")
    
    def get_display_style(self) -> str:
        """Get user-friendly style name."""
        return self.style.value.replace("_", " ")

class ProcessingResultDTO(BaseModel):
    """
    DTO for processing results returned by the style transfer function.
    """
    processedImageUrl: str
    thumbnailUrl: str
    originalSize: str
    outputSize: str
    style: str
    prompt: Optional[str]
    strength: float
    qualityLevel: str
    inferenceSteps: int
    processingTimeSeconds: float
    isPremium: bool