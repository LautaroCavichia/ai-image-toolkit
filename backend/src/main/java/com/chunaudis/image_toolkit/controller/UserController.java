package com.chunaudis.image_toolkit.controller;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chunaudis.image_toolkit.dto.JobResponseDTO;
import com.chunaudis.image_toolkit.entity.Job;
import com.chunaudis.image_toolkit.entity.User;
import com.chunaudis.image_toolkit.service.TokenService;
import com.chunaudis.image_toolkit.service.UserService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = "*") // FIXME: restrict in production
public class UserController {
    
    private static final Logger log = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;
    private final TokenService tokenService;
    
    public UserController(UserService userService, TokenService tokenService) {
        this.userService = userService;
        this.tokenService = tokenService;
    }
    
    /**
     * Get user's job history for the last 30 days
     * Only available for non-guest users
     */
    @GetMapping("/history")
    public ResponseEntity<List<JobResponseDTO>> getUserHistory(HttpServletRequest request) {
        try {
            UUID userId = (UUID) request.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(401).build();
            }
            
            // Check if user is a guest
            User user = userService.getUserById(userId);
            if (user == null) {
                return ResponseEntity.status(404).build();
            }
            
            if (user.getIsGuest()) {
                return ResponseEntity.status(403).body(List.of()); // Guests don't have history
            }
            
            // Get user's job history for the last 30 days
            List<Job> jobs = userService.getUserJobHistory(userId, 30);
            
            // Convert to DTOs
            List<JobResponseDTO> history = jobs.stream()
                .map(job -> mapJobToJobResponseDTO(job, userId))
                .collect(Collectors.toList());
            
            log.info("Retrieved {} history items for user {}", history.size(), userId);
            return ResponseEntity.ok(history);
            
        } catch (Exception e) {
            log.error("Error retrieving user history", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get current user profile information
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(HttpServletRequest request) {
        try {
            UUID userId = (UUID) request.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(401).build();
            }
            
            User user = userService.getUserById(userId);
            if (user == null) {
                return ResponseEntity.status(404).build();
            }
            
            // Create a profile response
            UserProfileResponse profile = new UserProfileResponse(
                user.getUserId().toString(),
                user.getEmail(),
                user.getDisplayName(),
                user.getIsGuest(),
                user.getTokenBalance(),
                user.getCreatedAt()
            );
            
            return ResponseEntity.ok(profile);
            
        } catch (Exception e) {
            log.error("Error retrieving user profile", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Helper method to map Job to JobResponseDTO
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
            // For history, we always show the URLs if they exist
            String originalUrl = job.getProcessedImage().getProcessedStoragePath();
            String thumbnailUrl = createThumbnailUrl(originalUrl);
            dto.setThumbnailUrl(thumbnailUrl);
            
            // Show premium URL if user has premium access
            boolean hasPremiumAccess = job.getProcessedImage().getIsPremium();
            dto.setIsPremiumQuality(hasPremiumAccess);
            
            if (hasPremiumAccess) {
                dto.setProcessedImageUrl(originalUrl);
            } else {
                dto.setProcessedImageUrl(null);
            }
        }
        
        dto.setErrorMessage(job.getErrorMessage());
        dto.setTokenBalance(tokenService.getTokenBalance(userId));
        
        return dto;
    }
    
    /**
     * Create thumbnail URL using Cloudinary transformations
     */
    private String createThumbnailUrl(String originalUrl) {
        if (originalUrl == null || !originalUrl.contains("cloudinary.com")) {
            return originalUrl;
        }
        
        try {
            String[] parts = originalUrl.split("/upload/");
            if (parts.length == 2) {
                String baseUrl = parts[0] + "/upload/";
                String transformation = "w_400,h_300,c_fit,q_70/";
                String imagePath = parts[1];
                return baseUrl + transformation + imagePath;
            }
        } catch (Exception e) {
            log.error("Failed to create thumbnail URL from: {}", originalUrl, e);
        }
        
        return originalUrl;
    }
    
    // Inner class for profile response
    public static class UserProfileResponse {
        private String userId;
        private String email;
        private String displayName;
        private Boolean isGuest;
        private Integer tokenBalance;
        private java.time.OffsetDateTime createdAt;
        
        public UserProfileResponse(String userId, String email, String displayName, 
                                 Boolean isGuest, Integer tokenBalance, 
                                 java.time.OffsetDateTime createdAt) {
            this.userId = userId;
            this.email = email;
            this.displayName = displayName;
            this.isGuest = isGuest;
            this.tokenBalance = tokenBalance;
            this.createdAt = createdAt;
        }
        
        // Getters
        public String getUserId() { return userId; }
        public String getEmail() { return email; }
        public String getDisplayName() { return displayName; }
        public Boolean getIsGuest() { return isGuest; }
        public Integer getTokenBalance() { return tokenBalance; }
        public java.time.OffsetDateTime getCreatedAt() { return createdAt; }
    }
}