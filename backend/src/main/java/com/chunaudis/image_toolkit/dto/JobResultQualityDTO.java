package com.chunaudis.image_toolkit.dto;

import lombok.Data;

@Data
public class JobResultQualityDTO {
    private String processedImageUrl;
    private String thumbnailUrl;  // Low-quality preview for free users
    private Boolean isPremiumQuality;
    private Integer tokenCost;
    
    public JobResultQualityDTO(String processedImageUrl, String thumbnailUrl, Boolean isPremiumQuality, Integer tokenCost) {
        this.processedImageUrl = processedImageUrl;
        this.thumbnailUrl = thumbnailUrl;
        this.isPremiumQuality = isPremiumQuality;
        this.tokenCost = tokenCost;
    }
}