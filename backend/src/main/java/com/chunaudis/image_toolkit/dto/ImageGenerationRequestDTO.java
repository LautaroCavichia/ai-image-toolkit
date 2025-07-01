package com.chunaudis.image_toolkit.dto;

import com.chunaudis.image_toolkit.entity.enums.JobTypeEnum;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

@Data
public class ImageGenerationRequestDTO {
    private String userId; // Or get from authenticated principal
    
    @NotNull(message = "Job type is required")
    private JobTypeEnum jobType;
    
    @NotBlank(message = "Prompt is required for image generation")
    private String prompt;
    
    private String negativePrompt;
    private String aspectRatio = "square";
    private String quality = "FREE";
    private Integer steps = 20;
    private Double guidanceScale = 7.5;
}