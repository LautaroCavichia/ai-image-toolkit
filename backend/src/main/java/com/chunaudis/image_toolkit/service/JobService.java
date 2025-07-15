package com.chunaudis.image_toolkit.service;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
//Retrys
import org.springframework.retry.annotation.Retryable;
import org.springframework.retry.annotation.Backoff;
import org.springframework.transaction.annotation.Transactional;


import com.chunaudis.image_toolkit.dto.JobMessageDTO;
import com.chunaudis.image_toolkit.dto.JobStatusUpdateRequestDTO;
import com.chunaudis.image_toolkit.entity.Image;
import com.chunaudis.image_toolkit.entity.Job;
import com.chunaudis.image_toolkit.entity.ProcessedImage;
import com.chunaudis.image_toolkit.entity.User;
import com.chunaudis.image_toolkit.entity.enums.JobStatusEnum;
import com.chunaudis.image_toolkit.entity.enums.JobTypeEnum;
import com.chunaudis.image_toolkit.repository.ImageRepository;
import com.chunaudis.image_toolkit.repository.JobRepository;
import com.chunaudis.image_toolkit.repository.ProcessedImageRepository;
import com.chunaudis.image_toolkit.repository.UserRepository;
import com.chunaudis.image_toolkit.storage.CloudinaryStorageService;

import jakarta.persistence.EntityNotFoundException;

@Service

public class JobService {
    private static final Logger log = LoggerFactory.getLogger(JobService.class);

    private final JobRepository jobRepository;
    private final JobPublisherService jobPublisherService;
    private final ProcessedImageRepository processedImageRepository;
    private final UserRepository userRepository; 
    private final ImageRepository imageRepository;
    private final CloudinaryStorageService cloudinaryStorageService;
    private final CloudinaryCleanupService cloudinaryCleanupService;

    public JobService(JobRepository jobRepository,
                      JobPublisherService jobPublisherService,
                      ProcessedImageRepository processedImageRepository,
                      UserRepository userRepository,
                      ImageRepository imageRepository,
                      CloudinaryStorageService cloudinaryStorageService,
                      CloudinaryCleanupService cloudinaryCleanupService) {
        this.jobRepository = jobRepository;
        this.jobPublisherService = jobPublisherService;
        this.processedImageRepository = processedImageRepository;
        this.userRepository = userRepository;
        this.imageRepository = imageRepository;
        this.cloudinaryStorageService = cloudinaryStorageService;
        this.cloudinaryCleanupService = cloudinaryCleanupService;
    }

   @Retryable(
    value = { Exception.class },
    maxAttempts = 3,
    backoff = @Backoff(delay = 2000) // Espera 2 segundos entre reintentos
)
@Transactional
public Job createAndDispatchJob(Image image, JobTypeEnum jobType, String imageStoragePath, Map<String, Object> jobConfig, UUID userId) {
    // User lookup - reuse from image entity to avoid duplicate query
    User user = image.getUser();
    
    // Create the job with all properties in one batch
    Job job = new Job();
    job.setUser(user);
    job.setOriginalImage(image);
    job.setJobType(jobType);
    job.setStatus(JobStatusEnum.QUEUED);
    job.setJobConfig(jobConfig != null ? convertMapToJsonString(jobConfig) : null);

    Job savedJob = jobRepository.save(job);
    log.info("Created job {} with status QUEUED", savedJob.getJobId());

    // Prepare RabbitMQ message
    JobMessageDTO message = new JobMessageDTO(
            savedJob.getJobId(),
            image.getImageId(),
            imageStoragePath,
            jobType,
            jobConfig
    );

    // Publish message with error handling
    try {
        jobPublisherService.publishJob(message);
        log.info("Dispatched job {} to RabbitMQ", savedJob.getJobId());
    } catch (Exception e) {
        log.error("Failed to dispatch job {} to RabbitMQ: {}", savedJob.getJobId(), e.getMessage(), e);
        
        // Update status to failed in single operation
        savedJob.setStatus(JobStatusEnum.FAILED);
        jobRepository.save(savedJob);
        
        // Re-throw for retry mechanism
        throw e;
    }

    return savedJob;
}
    @Transactional
    public Job updateJobStatus(UUID jobId, JobStatusUpdateRequestDTO updateRequest) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new EntityNotFoundException("Job not found with ID: " + jobId));

        job.setStatus(updateRequest.getStatus());
        job.setErrorMessage(updateRequest.getErrorMessage()); // Can be null

        if (updateRequest.getStatus() == JobStatusEnum.PROCESSING && job.getStartedAt() == null) {
            job.setStartedAt(OffsetDateTime.now());
        }

        if (updateRequest.getStatus() == JobStatusEnum.COMPLETED || updateRequest.getStatus() == JobStatusEnum.FAILED) {
            job.setCompletedAt(OffsetDateTime.now());
        }

        if (updateRequest.getStatus() == JobStatusEnum.COMPLETED && updateRequest.getProcessedStoragePath() != null) {
            // Create processed image record
            ProcessedImage processedImage = new ProcessedImage();
            processedImage.setJob(job);
            processedImage.setOriginalImage(job.getOriginalImage());
            processedImage.setProcessedStoragePath(updateRequest.getProcessedStoragePath()); // Cloudinary URL
            
            // Extract Cloudinary public ID for future deletion
            String publicId = cloudinaryStorageService.extractPublicId(updateRequest.getProcessedStoragePath());
            processedImage.setCloudinaryPublicId(publicId);
            
            // Extract filename from URL
            String filename = extractFilenameFromUrl(updateRequest.getProcessedStoragePath());
            processedImage.setProcessedFilename(filename);
            
            // Set placeholder values for filesize, width, height
            // TODO: These should be computed from the actual image file or from Cloudinary API
            processedImage.setProcessedFilesizeBytes(10000L); // Placeholder
            processedImage.setProcessedWidth(800); // Placeholder
            processedImage.setProcessedHeight(600); // Placeholder
            processedImage.setProcessedFormat("PNG"); // Placeholder
            
            // Set processing parameters
            processedImage.setProcessingParams(updateRequest.getProcessingParams() != null ? 
                    convertMapToJsonString(updateRequest.getProcessingParams()) : null);
            
            // Initially set as non-premium (free version)
            processedImage.setIsPremium(false);
            
            // Save processed image
            ProcessedImage savedProcessedImage = processedImageRepository.save(processedImage);
            job.setProcessedImage(savedProcessedImage); // Link it back
            
            // Schedule deletion for non-premium images (immediate after download)
            cloudinaryCleanupService.scheduleImmediateDeletion(savedProcessedImage.getProcessedImageId());
            
            log.info("Created processed image record with Cloudinary URL: {}", updateRequest.getProcessedStoragePath());
        }
        
        log.info("Updating job {} to status {}", jobId, updateRequest.getStatus());
        return jobRepository.save(job);
    }

    public Job getJobStatus(UUID jobId) {
        return jobRepository.findById(jobId)
                .orElseThrow(() -> new EntityNotFoundException("Job not found with ID: " + jobId));
    }

    /**
     * Upgrade processed image to premium and schedule 30-day deletion
     */
    @Transactional
    public void upgradeToP(UUID jobId) {
        Job job = getJobStatus(jobId);
        if (job.getProcessedImage() != null) {
            ProcessedImage processedImage = job.getProcessedImage();
            processedImage.setIsPremium(true);
            processedImage.setScheduledDeletionAt(null); // Remove immediate deletion
            processedImageRepository.save(processedImage);
            
            // Schedule 30-day deletion for premium
            cloudinaryCleanupService.schedulePremiumDeletion(processedImage.getProcessedImageId());
            
            log.info("Upgraded job {} to premium quality", jobId);
        }
    }

    // Helper to convert Map to JSON string
    private String convertMapToJsonString(Map<String, Object> map) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
            return objectMapper.writeValueAsString(map);
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            log.warn("Error converting map to JSON string for job config/params", e);
            return "{}"; // Empty JSON object as fallback
        }
    }

    // Helper to extract filename from Cloudinary URL
    private String extractFilenameFromUrl(String url) {
        if (url == null) return "unknown";
        String[] parts = url.split("/");
        return parts[parts.length - 1];
    }
}