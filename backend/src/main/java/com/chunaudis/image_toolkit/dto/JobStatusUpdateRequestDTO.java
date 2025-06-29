package com.chunaudis.image_toolkit.dto;

import java.util.Map;

import com.chunaudis.image_toolkit.entity.enums.JobStatusEnum;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Data
public class JobStatusUpdateRequestDTO {
    @NotNull(message = "Status is required")
    private JobStatusEnum status;
    
    @Size(max = 500, message = "Processed storage path must not exceed 500 characters")
    private String processedStoragePath; // Path from Python service
    
    private Map<String, Object> processingParams; // Params used by Python
    
    @Size(max = 1000, message = "Error message must not exceed 1000 characters")
    private String errorMessage;
}