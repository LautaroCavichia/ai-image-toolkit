package com.chunaudis.image_toolkit.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.chunaudis.image_toolkit.entity.enums.JobStatusEnum;
import com.chunaudis.image_toolkit.entity.enums.JobTypeEnum;

import lombok.Data;

@Data
public class JobResponseDTO {
    private UUID jobId;
    private UUID originalImageId;
    private JobTypeEnum jobType;
    private JobStatusEnum status;
    private OffsetDateTime createdAt;
    private OffsetDateTime completedAt;
    private String processedImageUrl; // URL to the result
    private String thumbnailUrl; // Low quality preview
    private Boolean isPremiumQuality; // Whether full quality is available
    private Integer tokenCost; // Cost to unlock premium
    private String errorMessage;
    private Integer tokenBalance; // Current user's token balance FIXME: is it updated?
}

