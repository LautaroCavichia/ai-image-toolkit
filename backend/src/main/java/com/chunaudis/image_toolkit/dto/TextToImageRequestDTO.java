package com.chunaudis.image_toolkit.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Map;

@Data
public class TextToImageRequestDTO {
    @NotBlank(message = "Prompt is required")
    private String prompt;
    
    @NotNull(message = "Job config is required")
    private Map<String, Object> jobConfig;
}