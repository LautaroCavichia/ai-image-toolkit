package com.chunaudis.image_toolkit.dto;

import com.chunaudis.image_toolkit.entity.enums.JobTypeEnum;

import lombok.Data;
import jakarta.validation.constraints.NotNull;

@Data
public class ImageUploadRequestDTO {
    private String userId; // Or get from authenticated principal
    
    @NotNull(message = "Job type is required")
    private JobTypeEnum jobType;
}