package com.chunaudis.image_toolkit.dto;

import java.util.Map;
import java.util.UUID;

import com.chunaudis.image_toolkit.entity.enums.JobTypeEnum;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobMessageDTO {
    private UUID jobId;
    private UUID originalImageId;
    private String imageStoragePath; // Path to original image (local or cloud)
    private JobTypeEnum jobType;
    private Map<String, Object> jobConfig; // Specific config for the job
}