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
import com.chunaudis.image_toolkit.dto.ImageGenerationRequestDTO;
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

    @Transactional
    public Job processImageGeneration(ImageGenerationRequestDTO requestDTO, Map<String, Object> jobConfig) {
        // Get userId from the request DTO
        UUID userId = UUID.fromString(requestDTO.getUserId());
    
        // Find existing user by ID
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));
        
        log.info("Processing image generation request for user {}, prompt: {}", userId, requestDTO.getPrompt());
        
        try {
            // For image generation, we don't have an original image, so we create a placeholder
            // The microservice will generate the image and upload it directly
            Image placeholderImage = new Image();
            UUID imageId = placeholderImage.getImageId(); // Get the auto-generated UUID
            
            // Set minimal metadata for the placeholder
            placeholderImage.setUser(user);
            placeholderImage.setOriginalFilename("generated_" + imageId.toString() + ".png");
            placeholderImage.setOriginalFilesizeBytes(0L); // Will be updated when image is generated
            placeholderImage.setOriginalFormat("PNG");
            
            // Set default dimensions (will be updated by microservice)
            String aspectRatio = (String) jobConfig.getOrDefault("aspectRatio", "square");
            int[] dimensions = getDefaultDimensions(aspectRatio);
            placeholderImage.setOriginalWidth(dimensions[0]);
            placeholderImage.setOriginalHeight(dimensions[1]);
            
            // For image generation, we don't upload an original image to Cloudinary yet
            // The microservice will handle the upload when generation is complete
            placeholderImage.setOriginalStoragePath(null);
            placeholderImage.setCloudinaryPublicId(null);

            // Save the placeholder image entity
            Image savedImage = imageRepository.save(placeholderImage);
            log.info("Created placeholder image for generation with ID: {}", savedImage.getImageId());

            // Create and dispatch job - pass null for originalImageUrl since we don't have one
            return jobService.createAndDispatchJob(savedImage, requestDTO.getJobType(), null, jobConfig, userId);
            
        } catch (Exception e) {
            log.error("Failed to process image generation request for user {}: {}", userId, e.getMessage(), e);
            
            // Re-throw the original exception
            if (e instanceof RuntimeException) {
                throw (RuntimeException) e;
            } else {
                throw new RuntimeException("Failed to process image generation request", e);
            }
        }
    }

    private int[] getDefaultDimensions(String aspectRatio) {
        switch (aspectRatio.toLowerCase()) {
            case "portrait":
                return new int[]{512, 768};
            case "landscape":
                return new int[]{768, 512};
            case "square":
            default:
                return new int[]{512, 512};
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


    public boolean isImageCorrupt(MultipartFile file) {
    try {
        BufferedImage img = ImageIO.read(file.getInputStream());
        if (img == null) {
            return true;
        }
        return false;
    } catch (Exception e) {
        return true;
    }
}

}