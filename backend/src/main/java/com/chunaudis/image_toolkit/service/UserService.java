package com.chunaudis.image_toolkit.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.chunaudis.image_toolkit.entity.Job;
import com.chunaudis.image_toolkit.entity.User;
import com.chunaudis.image_toolkit.repository.JobRepository;
import com.chunaudis.image_toolkit.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class UserService {
    
    private static final Logger log = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    
    public UserService(UserRepository userRepository, JobRepository jobRepository) {
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
    }
    
    /**
     * Get user by ID
     */
    public User getUserById(UUID userId) {
        return userRepository.findById(userId).orElse(null);
    }
    
    /**
     * Get user's job history for the specified number of days
     * Only returns jobs for non-guest users
     */
    public List<Job> getUserJobHistory(UUID userId, int days) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));
        
        if (user.getIsGuest()) {
            log.info("Guest user {} requested history - returning empty list", userId);
            return List.of(); // Guests don't have persistent history
        }
        
        OffsetDateTime cutoffDate = OffsetDateTime.now().minusDays(days);
        
        // Create pageable to limit results (max 100 jobs)
        Pageable pageable = PageRequest.of(0, 100, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        List<Job> jobs = jobRepository.findByUserUserIdAndCreatedAtAfter(userId, cutoffDate, pageable);
        
        log.info("Retrieved {} jobs for user {} in the last {} days", jobs.size(), userId, days);
        return jobs;
    }
    
    /**
     * Get user's recent jobs (last 10)
     */
    public List<Job> getUserRecentJobs(UUID userId, int limit) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));
        
        if (user.getIsGuest()) {
            return List.of(); // Guests don't have persistent history
        }
        
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        return jobRepository.findByUserUserId(userId, pageable);
    }
    
    /**
     * Get total number of jobs processed by user
     */
    public long getUserJobCount(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));
        
        if (user.getIsGuest()) {
            return 0; // Guests don't have persistent history
        }
        
        return jobRepository.countByUserUserId(userId);
    }
    
    /**
     * Check if user exists and is not a guest
     */
    public boolean isRegisteredUser(UUID userId) {
        User user = userRepository.findById(userId).orElse(null);
        return user != null && !user.getIsGuest();
    }
    
    /**
     * Update user profile information
     */
    public User updateUserProfile(UUID userId, String displayName, String email) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));
        
        if (user.getIsGuest()) {
            throw new IllegalStateException("Cannot update profile for guest user");
        }
        
        if (displayName != null && !displayName.trim().isEmpty()) {
            user.setDisplayName(displayName.trim());
        }
        
        if (email != null && !email.trim().isEmpty()) {
            // Check if email is already taken by another user
            if (userRepository.existsByEmail(email) && !email.equals(user.getEmail())) {
                throw new IllegalArgumentException("Email is already in use");
            }
            user.setEmail(email.trim());
        }
        
        return userRepository.save(user);
    }
}