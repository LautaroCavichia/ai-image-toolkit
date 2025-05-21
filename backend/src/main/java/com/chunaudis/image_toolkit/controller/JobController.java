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
        log.info("Received  RAW status update for job {}: {}", jobId, rawBody);
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

    // Modified to include quality info
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
            // For free users or those who haven't paid, provide the thumbnail path
            String originalPath = job.getProcessedImage().getProcessedStoragePath();
            String thumbnailPath = originalPath.substring(0, originalPath.lastIndexOf('.')) + "_thumbnail.png";
            dto.setThumbnailUrl(thumbnailPath);
            
            // Check if this is a premium result that the user has paid for
            boolean hasPaidForPremium = false;
            if (userId != null) {
                hasPaidForPremium = tokenService.hasEnoughTokens(userId, job.getJobType());
            }
            dto.setIsPremiumQuality(hasPaidForPremium);
            
            // Only include the full quality URL if user has paid or the job doesn't require tokens
            if (hasPaidForPremium) {
                dto.setProcessedImageUrl(job.getProcessedImage().getProcessedStoragePath());
            } else {
                // For unpaid premium content, only the thumbnail is available
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
}