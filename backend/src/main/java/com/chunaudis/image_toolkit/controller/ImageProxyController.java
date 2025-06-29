package com.chunaudis.image_toolkit.controller;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.chunaudis.image_toolkit.entity.Job;
import com.chunaudis.image_toolkit.entity.ProcessedImage;
import com.chunaudis.image_toolkit.service.ImageProxyService;
import com.chunaudis.image_toolkit.service.JobService;
import com.chunaudis.image_toolkit.service.TokenService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/v1/images")
public class ImageProxyController {

    private static final Logger log = LoggerFactory.getLogger(ImageProxyController.class);
    
    private final ImageProxyService imageProxyService;
    private final JobService jobService;
    private final TokenService tokenService;

    public ImageProxyController(ImageProxyService imageProxyService, JobService jobService, TokenService tokenService) {
        this.imageProxyService = imageProxyService;
        this.jobService = jobService;
        this.tokenService = tokenService;
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<?> getProcessedImage(
            @PathVariable UUID jobId,
            @RequestParam(defaultValue = "false") boolean premium,
            HttpServletRequest request) {
        
        try {
            // Get authenticated user ID
            UUID userId = (UUID) request.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            // Get job and verify ownership
            Job job = jobService.getJobStatus(jobId);
            if (job == null) {
                return ResponseEntity.notFound().build();
            }

            if (!job.getUser().getUserId().equals(userId)) {
                log.warn("User {} attempted to access job {} owned by {}", 
                    userId, jobId, job.getUser().getUserId());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            ProcessedImage processedImage = job.getProcessedImage();
            if (processedImage == null) {
                return ResponseEntity.notFound().build();
            }

            // Check premium access - user has paid for premium quality for this job
            boolean userHasPremiumAccess = processedImage.getIsPremium();
            boolean requestingPremium = premium;

            // Premium access control: only allow premium download if user has paid for it
            if (requestingPremium && !userHasPremiumAccess) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Premium access required for full quality image. Please unlock premium quality first.");
            }

            // Get image data with appropriate quality
            byte[] imageData;
            String contentType;
            
            if (requestingPremium && userHasPremiumAccess) {
                // Serve full quality image (user has paid for premium)
                imageData = imageProxyService.getFullQualityImage(processedImage.getProcessedStoragePath());
                contentType = "image/png"; // Full quality
                log.info("Serving premium image for job {} to user {}", jobId, userId);
            } else {
                // Serve thumbnail/compressed version 
                // Available to ALL authenticated users who own the job, regardless of premium payment
                // Used for: preview, free download, and before premium unlock
                imageData = imageProxyService.getThumbnailImage(processedImage.getProcessedStoragePath());
                contentType = "image/jpeg"; // Compressed
                log.info("Serving thumbnail image for job {} to user {} (free access)", jobId, userId);
            }

            // Set appropriate headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));
            headers.setContentLength(imageData.length);
            headers.setCacheControl("private, max-age=3600"); // Cache for 1 hour
            headers.set("X-Robots-Tag", "noindex, nofollow"); // Prevent indexing
            
            // Add security headers
            headers.set("X-Content-Type-Options", "nosniff");
            headers.set("X-Frame-Options", "DENY");

            return ResponseEntity.ok()
                .headers(headers)
                .body(new InputStreamResource(new ByteArrayInputStream(imageData)));

        } catch (Exception e) {
            log.error("Error serving image for job {}: {}", jobId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{jobId}/thumbnail")
    public ResponseEntity<?> getThumbnail(
            @PathVariable UUID jobId,
            HttpServletRequest request) {
        
        // Always serve thumbnail to authenticated users - no premium payment required
        // This is used for preview and free download in the frontend
        return getProcessedImage(jobId, false, request);
    }
}