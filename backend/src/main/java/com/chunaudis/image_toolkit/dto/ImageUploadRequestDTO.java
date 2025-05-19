package com.chunaudis.image_toolkit.dto;

import com.chunaudis.image_toolkit.entity.enums.JobTypeEnum;

import lombok.Data;

@Data
public class ImageUploadRequestDTO {
    private String userId; // Or get from authenticated principal
    private JobTypeEnum jobType;
}