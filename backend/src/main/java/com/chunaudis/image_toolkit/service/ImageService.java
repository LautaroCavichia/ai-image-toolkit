package com.chunaudis.image_toolkit.service;

import java.util.Map;
import java.util.UUID;

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
import com.chunaudis.image_toolkit.storage.FileStorageService;

import jakarta.persistence.EntityNotFoundException;

@Service
public class ImageService {
    private static final Logger log = LoggerFactory.getLogger(ImageService.class);

    private final ImageRepository imageRepository;
    private final UserRepository userRepository; 
    private final FileStorageService fileStorageService;
    private final JobService jobService;

    public ImageService(ImageRepository imageRepository, UserRepository userRepository,
            FileStorageService fileStorageService, JobService jobService) {
        this.imageRepository = imageRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.jobService = jobService;
    }

    @Transactional
    public Job processUploadedImage(MultipartFile file, ImageUploadRequestDTO requestDTO,
            Map<String, Object> jobConfig) {
        // Get userId from the request DTO
        UUID userId = UUID.fromString(requestDTO.getUserId());
    
        // Find existing user by ID
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));
        
        // Create new image entity
        Image image = new Image();
        image.setUser(user);
        image.setOriginalFilename(file.getOriginalFilename());
        image.setOriginalFilesizeBytes(file.getSize());

        // Set initial path using userId and imageId, will be updated with actual path
        // after storage
        String initialPath = String.format("originals/%s/%s", userId, image.getImageId());
        image.setOriginalStoragePath(initialPath);

        // Extract format from file
        image.setOriginalFormat(extractFormat(file.getContentType()));
        
        // TODO: Extract width and height using a proper library like ImageIO
        // For now, using placeholder values
        image.setOriginalWidth(800); // Placeholder
        image.setOriginalHeight(600); // Placeholder

        // Save image metadata first to get an ID
        Image savedImage = imageRepository.save(image);
        log.info("Saved image metadata for ID: {}", savedImage.getImageId());

        // Then store the file using the generated imageId for naming
        String storedFilePath = fileStorageService.storeOriginalFile(file, userId, savedImage.getImageId());
        savedImage.setOriginalStoragePath(storedFilePath); // Update with actual path
        imageRepository.save(savedImage); // Save again to update path

        log.info("Image file stored at: {}", storedFilePath);

        // Create and dispatch job
        return jobService.createAndDispatchJob(savedImage, requestDTO.getJobType(), storedFilePath, jobConfig, userId);
    }

    private String extractFormat(String contentType) {
        if (contentType != null && contentType.startsWith("image/")) {
            return contentType.substring("image/".length()).toUpperCase();
        }
        return "UNKNOWN"; // Default for unknown format
    }
}