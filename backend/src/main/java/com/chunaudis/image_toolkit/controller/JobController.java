package com.chunaudis.image_toolkit.controller;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chunaudis.image_toolkit.dto.JobResponseDTO;
import com.chunaudis.image_toolkit.dto.JobStatusUpdateRequestDTO;
import com.chunaudis.image_toolkit.entity.Job;
import com.chunaudis.image_toolkit.service.JobService;
import com.chunaudis.image_toolkit.service.TokenService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/v1/jobs")
@CrossOrigin(origins = "*") // FIXME: Allow all for dev, restrict in prod!
public class JobController {
    private static final Logger log = LoggerFactory.getLogger(JobController.class);
    private final JobService jobService;
    private final ObjectMapper objectMapper;
    private final TokenService tokenService;

    public JobController(JobService jobService, ObjectMapper objectMapper, TokenService tokenService) {
        this.jobService = jobService;
        this.objectMapper = objectMapper;
        this.tokenService = tokenService;
    }

    // Endpoint for Python microservice to call back
    @PostMapping("/{jobId}/status")
    public ResponseEntity<Void> updateJobStatus(
            @PathVariable UUID jobId,
            @RequestBody @jakarta.validation.constraints.Size(max = 10000, message = "Request body too large") String rawBody) {
        log.info("Received RAW status update for job {}: {}", jobId, rawBody);
        try {
            JobStatusUpdateRequestDTO updateRequest = objectMapper.readValue(rawBody, JobStatusUpdateRequestDTO.class);
            jobService.updateJobStatus(jobId, updateRequest);
            return ResponseEntity.ok().build();
        } catch (JsonProcessingException e) {
            log.error("Error parsing job status update for job {}: {}", jobId, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // Endpoint for frontend to poll job status
    @GetMapping("/{jobId}/status")
    public ResponseEntity<JobResponseDTO> getJobStatus(
            @PathVariable UUID jobId, 
            HttpServletRequest request) {
        try {
            UUID userId = (UUID) request.getAttribute("userId");
            
            Job job = jobService.getJobStatus(jobId);
            JobResponseDTO response = mapJobToJobResponseDTO(job, userId);
            return ResponseEntity.ok(response);
        } catch (jakarta.persistence.EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error fetching job status for job {}: ", jobId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/{jobId}/unlock-premium")
    public ResponseEntity<?> unlockPremiumQuality(@PathVariable UUID jobId, HttpServletRequest request) {
        try {
            UUID userId = (UUID) request.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            Job job = jobService.getJobStatus(jobId);
            
            if (!job.getUser().getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You don't have access to this job");
            }
            
            // Try to deduct tokens
            boolean success = tokenService.deductTokens(userId, job.getJobType());
            if (!success) {
                return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body("Not enough tokens to unlock premium quality");
            }
            
            // Upgrade to premium
            jobService.upgradeToP(jobId);
            
            // Return the job with updated access
            JobResponseDTO response = mapJobToJobResponseDTO(job, userId);
            response.setIsPremiumQuality(true);
            response.setProcessedImageUrl(job.getProcessedImage().getProcessedStoragePath());
            
            // Include updated token balance
            response.setTokenBalance(tokenService.getTokenBalance(userId));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error unlocking premium quality: " + e.getMessage());
        }
    }

    // Modified to work with Cloudinary URLs
    private JobResponseDTO mapJobToJobResponseDTO(Job job, UUID userId) {
        JobResponseDTO dto = new JobResponseDTO();
        dto.setJobId(job.getJobId());
        if (job.getOriginalImage() != null) {
            dto.setOriginalImageId(job.getOriginalImage().getImageId());
        }
        dto.setJobType(job.getJobType());
        dto.setStatus(job.getStatus());
        dto.setCreatedAt(job.getCreatedAt());
        dto.setCompletedAt(job.getCompletedAt());
        
        int tokenCost = tokenService.getTokenCost(job.getJobType());
        dto.setTokenCost(tokenCost);
        
        if (job.getProcessedImage() != null) {
            String originalUrl = job.getProcessedImage().getProcessedStoragePath();
            log.info("Processed image URL: {}", originalUrl);
            
            // Check if this user has premium access
            boolean hasPremiumAccess = job.getProcessedImage().getIsPremium();
            dto.setIsPremiumQuality(hasPremiumAccess);
            
            // For premium images, provide secure proxy URLs
            String baseUrl = "/api/v1/images/" + job.getJobId();
            
            if (hasPremiumAccess) {
                // User has premium access - can access full quality via proxy
                dto.setProcessedImageUrl(baseUrl + "?premium=true");
            } else {
                // Free user - only gets thumbnail via proxy  
                dto.setProcessedImageUrl(null);
            }
            
            // Extract direct Cloudinary thumbnail URL from processing parameters for frontend compatibility
            String thumbnailUrl = extractThumbnailUrlFromProcessingParams(job.getProcessedImage().getProcessingParams());
            if (thumbnailUrl != null && !thumbnailUrl.isEmpty()) {
                // Use direct Cloudinary URL for frontend compatibility
                dto.setThumbnailUrl(thumbnailUrl);
                log.info("Direct Cloudinary thumbnail URL: {}", thumbnailUrl);
            } else {
                // Fallback to proxy URL if thumbnail_url not found in processing params
                dto.setThumbnailUrl(baseUrl + "/thumbnail");
                log.info("Fallback to secure thumbnail URL: {}", baseUrl + "/thumbnail");
            }
        }
        
        dto.setErrorMessage(job.getErrorMessage());
        
        // Add token balance if userId is available
        if (userId != null) {
            dto.setTokenBalance(tokenService.getTokenBalance(userId));
        }
        
        return dto;
    }

    /**
     * Extract thumbnail_url from processing parameters JSON
     */
    private String extractThumbnailUrlFromProcessingParams(String processingParams) {
        if (processingParams == null || processingParams.trim().isEmpty()) {
            return null;
        }
        
        try {
            JsonNode jsonNode = objectMapper.readTree(processingParams);
            JsonNode thumbnailUrlNode = jsonNode.get("thumbnail_url");
            if (thumbnailUrlNode != null && !thumbnailUrlNode.isNull()) {
                return thumbnailUrlNode.asText();
            }
        } catch (JsonProcessingException e) {
            log.warn("Failed to parse processing parameters JSON: {}", e.getMessage());
        }
        
        return null;
    }

}