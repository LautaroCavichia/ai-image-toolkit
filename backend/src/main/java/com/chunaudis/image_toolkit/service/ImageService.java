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

@Service
public class ImageService {
    private static final Logger log = LoggerFactory.getLogger(ImageService.class);

    private final ImageRepository imageRepository;
    private final UserRepository userRepository; // For fetching the user
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
        // In a real app, get userId from security context (e.g., JWT Principal)
        UUID userId = UUID.fromString(requestDTO.getUserId());
    
        // Try to find existing user first
        User user = userRepository.findById(userId).orElse(null); 
        
        if (user == null) {
            user = new User();
            user.setUserId(userId);
            user.setEmail("test_" + userId + "@example.com");
            user.setPasswordHash("$2a$12$dummyHashForTestingOnly1234567890123456789012");
            user.setDisplayName("Test User " + userId);
            user = userRepository.save(user); // FIXME
        }
        Image image = new Image();
        image.setUser(user);
        image.setOriginalFilename(file.getOriginalFilename());
        image.setOriginalFilesizeBytes(file.getSize());

        // Set initial path using userId and imageId, will be updated with actual path
        // after storage
        String initialPath = String.format("originals/%s/%s", userId, image.getImageId());
        image.setOriginalStoragePath(initialPath);

        // TODO: Extract format, width, height - perhaps after saving and using a
        // library
        image.setOriginalFormat(extractFormat(file.getContentType()));
        image.setOriginalWidth(0); // Placeholder
        image.setOriginalHeight(0); // Placeholder

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
        return "UNKNOWN"; // FIXME: handle better
    }
}