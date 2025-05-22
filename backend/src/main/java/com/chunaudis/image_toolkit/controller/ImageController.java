package com.chunaudis.image_toolkit.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.chunaudis.image_toolkit.dto.ImageUploadRequestDTO;   
import com.chunaudis.image_toolkit.dto.JobResponseDTO;
import com.chunaudis.image_toolkit.entity.Job;
import com.chunaudis.image_toolkit.entity.enums.JobTypeEnum;
import com.chunaudis.image_toolkit.service.ImageService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/v1/images")
@CrossOrigin(origins = "*") // FIXME: restrict in production
public class ImageController {
    private static final Logger log = LoggerFactory.getLogger(ImageController.class);
    private final ImageService imageService;
    private final ObjectMapper objectMapper;

    public ImageController(ImageService imageService, ObjectMapper objectMapper) {
        this.imageService = imageService;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/upload")
    public ResponseEntity<JobResponseDTO> uploadImageAndCreateJob(
            @RequestParam("file") MultipartFile file,
            @RequestParam("jobType") JobTypeEnum jobType,
            @RequestParam(value = "jobConfig", required = false) String jobConfigJson,
            HttpServletRequest request
    ) {
        // Get user ID from security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        // Get user ID from request attribute set in JwtRequestFilter
        UUID userId = (UUID) request.getAttribute("userId");
        if (userId == null) {
            UUID authPrincipalUserId = (UUID) authentication.getPrincipal();
            // Use authentication principal as fallback
            userId = authPrincipalUserId;
        }
        
        log.info("Received image upload request for user: {}, jobType: {}", userId, jobType);
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        ImageUploadRequestDTO requestDTO = new ImageUploadRequestDTO();
        requestDTO.setUserId(userId.toString());
        requestDTO.setJobType(jobType);

        // Parse job config if provided
        Map<String, Object> jobConfig = new HashMap<>();
        if (jobConfigJson != null && !jobConfigJson.trim().isEmpty()) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> parsedConfig = objectMapper.readValue(jobConfigJson, Map.class);
                jobConfig.putAll(parsedConfig);
                log.info("Parsed job config: {}", jobConfig);
            } catch (JsonProcessingException e) {
                log.warn("Failed to parse job config JSON: {}", jobConfigJson, e);
                // Continue with empty config instead of failing
            }
        }

        // Set default configs based on job type
        if (jobType == JobTypeEnum.UPSCALE) {
            jobConfig.putIfAbsent("quality", "FREE"); // Default to free quality
            jobConfig.putIfAbsent("scale", 2); // Default scale factor
        } else if (jobType == JobTypeEnum.ENLARGE) {
            jobConfig.putIfAbsent("scaleFactor", 2); // Default scale factor for enlarge
        }

        try {
            Job createdJob = imageService.processUploadedImage(file, requestDTO, jobConfig);
            JobResponseDTO response = mapJobToJobResponseDTO(createdJob);
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
        } catch (Exception e) {
            log.error("Error processing image upload: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Helper to map Job entity to DTO
    private JobResponseDTO mapJobToJobResponseDTO(Job job) {
        JobResponseDTO dto = new JobResponseDTO();
        dto.setJobId(job.getJobId());
        dto.setOriginalImageId(job.getOriginalImage().getImageId());
        dto.setJobType(job.getJobType());
        dto.setStatus(job.getStatus());
        dto.setCreatedAt(job.getCreatedAt());
        dto.setCompletedAt(job.getCompletedAt());
        if (job.getProcessedImage() != null) {
            dto.setProcessedImageUrl(job.getProcessedImage().getProcessedStoragePath()); // This will be a cloud URL later
        }
        dto.setErrorMessage(job.getErrorMessage());
        return dto;
    }
}