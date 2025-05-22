package com.chunaudis.image_toolkit.service;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Map;
import java.util.UUID;

import javax.imageio.ImageIO;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.chunaudis.image_toolkit.dto.ImageUploadRequestDTO;
import com.chunaudis.image_toolkit.entity.Image;
import com.chunaudis.image_toolkit.entity.Job;
import com.chunaudis.image_toolkit.entity.User;
import com.chunaudis.image_toolkit.repository.ImageRepository;
import com.chunaudis.image_toolkit.repository.UserRepository;
import com.chunaudis.image_toolkit.storage.CloudinaryStorageService;

import jakarta.persistence.EntityNotFoundException;

@Service
public class ImageService {
    private static final Logger log = LoggerFactory.getLogger(ImageService.class);

    private final ImageRepository imageRepository;
    private final UserRepository userRepository; 
    private final CloudinaryStorageService cloudinaryStorageService;
    private final JobService jobService;

    public ImageService(ImageRepository imageRepository, 
                       UserRepository userRepository,
                       CloudinaryStorageService cloudinaryStorageService, 
                       JobService jobService) {
        this.imageRepository = imageRepository;
        this.userRepository = userRepository;
        this.cloudinaryStorageService = cloudinaryStorageService;
        this.jobService = jobService;
    }

    @Transactional
    public Job processUploadedImage(MultipartFile file, ImageUploadRequestDTO requestDTO,
            Map<String, Object> jobConfig) {
        
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }
        
        // Get userId from the request DTO
        UUID userId = UUID.fromString(requestDTO.getUserId());
    
        // Find existing user by ID
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));
        
        // Create new image entity with generated UUID
        Image image = new Image();
        UUID imageId = image.getImageId(); // Get the auto-generated UUID
        
        log.info("Processing image upload for user {} with image ID: {}", userId, imageId);
        
        try {
            // Set basic image metadata
            image.setUser(user);
            image.setOriginalFilename(file.getOriginalFilename());
            image.setOriginalFilesizeBytes(file.getSize());
            image.setOriginalFormat(extractFormat(file.getContentType()));
            
            // Extract width and height from uploaded file
            int[] dimensions = getImageDimensions(file);
            image.setOriginalWidth(dimensions[0]);
            image.setOriginalHeight(dimensions[1]);

            // Upload to Cloudinary FIRST (before saving to database)
            log.info("Uploading image to Cloudinary for image ID: {}", imageId);
            String cloudinaryUrl = cloudinaryStorageService.uploadOriginalImage(file, userId, imageId);
            
            // Extract and store the public ID for future deletion
            String publicId = cloudinaryStorageService.extractPublicId(cloudinaryUrl);
            image.setCloudinaryPublicId(publicId);
            image.setOriginalStoragePath(cloudinaryUrl);

            // Now save the image entity with all required fields populated
            Image savedImage = imageRepository.save(image);
            log.info("Saved image metadata for ID: {} with Cloudinary URL: {}", savedImage.getImageId(), cloudinaryUrl);

            // Create and dispatch job
            return jobService.createAndDispatchJob(savedImage, requestDTO.getJobType(), cloudinaryUrl, jobConfig, userId);
            
        } catch (Exception e) {
            log.error("Failed to process image upload for user {}: {}", userId, e.getMessage(), e);
            
            // If we have a Cloudinary URL, try to clean it up
            if (image.getCloudinaryPublicId() != null) {
                try {
                    cloudinaryStorageService.deleteImage(image.getCloudinaryPublicId());
                    log.info("Cleaned up Cloudinary image after failed upload: {}", image.getCloudinaryPublicId());
                } catch (Exception cleanupException) {
                    log.warn("Failed to cleanup Cloudinary image: {}", image.getCloudinaryPublicId(), cleanupException);
                }
            }
            
            // Re-throw the original exception
            if (e instanceof RuntimeException) {
                throw (RuntimeException) e;
            } else {
                throw new RuntimeException("Failed to process image upload", e);
            }
        }
    }

    private String extractFormat(String contentType) {
        if (contentType != null && contentType.startsWith("image/")) {
            return contentType.substring("image/".length()).toUpperCase();
        }
        return "UNKNOWN"; // Default for unknown format
    }

    /**
     * Get image dimensions from uploaded file
     */
    private int[] getImageDimensions(MultipartFile file) {
        try {
            BufferedImage img = ImageIO.read(new ByteArrayInputStream(file.getBytes()));
            if (img != null) {
                return new int[] { img.getWidth(), img.getHeight() };
            }
        } catch (IOException e) {
            log.warn("Failed to read image dimensions for {}: {}", file.getOriginalFilename(), e.getMessage());
        }
        return new int[] { 800, 600 }; // Default values if reading fails
    }
}