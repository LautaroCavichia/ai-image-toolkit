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
            @RequestBody String rawBody) {
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
            // For Cloudinary, we'll create thumbnail URLs using URL transformations
            String originalUrl = job.getProcessedImage().getProcessedStoragePath();
            
            // Create thumbnail URL using Cloudinary transformations
            String thumbnailUrl = createThumbnailUrl(originalUrl);
            dto.setThumbnailUrl(thumbnailUrl);
            
            log.info("Processed image URL: {}", originalUrl);
            log.info("Thumbnail URL: {}", thumbnailUrl);
            
            // Check if this user has premium access
            boolean hasPremiumAccess = job.getProcessedImage().getIsPremium();
            dto.setIsPremiumQuality(hasPremiumAccess);
            
            // Only include the full quality URL if user has premium access
            if (hasPremiumAccess) {
                dto.setProcessedImageUrl(originalUrl);
            } else {
                dto.setProcessedImageUrl(null);
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
     * Create thumbnail URL using Cloudinary transformations
     * This keeps the same image but applies quality reduction
     */
    private String createThumbnailUrl(String originalUrl) {
        if (originalUrl == null || !originalUrl.contains("cloudinary.com")) {
            return originalUrl;
        }
        
        try {
            // Insert transformation parameters into Cloudinary URL
            // Original: https://res.cloudinary.com/cloud/image/upload/v123/folder/image.jpg
            // Thumbnail: https://res.cloudinary.com/cloud/image/upload/w_400,h_300,c_fit,q_70/v123/folder/image.jpg
            
            String[] parts = originalUrl.split("/upload/");
            if (parts.length == 2) {
                String baseUrl = parts[0] + "/upload/";
                String transformation = "w_400,h_300,c_fit,q_70/"; // Low quality transformation
                String imagePath = parts[1];
                
                return baseUrl + transformation + imagePath;
            }
        } catch (Exception e) {
            log.error("Failed to create thumbnail URL from: {}", originalUrl, e);
        }
        
        return originalUrl; // Fallback to original URL
    }
}