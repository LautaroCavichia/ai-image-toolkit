package com.chunaudis.image_toolkit.dto;

import java.util.Map;

import com.chunaudis.image_toolkit.entity.enums.JobStatusEnum;

import lombok.Data;

@Data
public class JobStatusUpdateRequestDTO {
    private JobStatusEnum status;
    private String processedStoragePath; // Path from Python service
    private Map<String, Object> processingParams; // Params used by Python
    private String errorMessage;
}