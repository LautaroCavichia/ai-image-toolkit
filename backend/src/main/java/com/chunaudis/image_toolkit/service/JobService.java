package com.chunaudis.image_toolkit.service;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
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

import jakarta.persistence.EntityNotFoundException;

@Service
public class JobService {
    private static final Logger log = LoggerFactory.getLogger(JobService.class);

    private final JobRepository jobRepository;
    private final JobPublisherService jobPublisherService;
    private final ProcessedImageRepository processedImageRepository;
    private final UserRepository userRepository; 
    private final ImageRepository imageRepository;

    public JobService(JobRepository jobRepository,
                      JobPublisherService jobPublisherService,
                      ProcessedImageRepository processedImageRepository,
                      UserRepository userRepository,
                      ImageRepository imageRepository) {
        this.jobRepository = jobRepository;
        this.jobPublisherService = jobPublisherService;
        this.processedImageRepository = processedImageRepository;
        this.userRepository = userRepository;
        this.imageRepository = imageRepository;
    }

    @Transactional
    public Job createAndDispatchJob(Image image, JobTypeEnum jobType, String imageStoragePath, Map<String, Object> jobConfig, UUID userId) {
        // Find the user by ID
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

        // Create a new job
        Job job = new Job();    
        job.setUser(user);
        job.setOriginalImage(image);
        job.setJobType(jobType);
        job.setStatus(JobStatusEnum.QUEUED); // Set to QUEUED as it's about to be published
        job.setJobConfig(jobConfig != null ? convertMapToJsonString(jobConfig) : null); // Convert Map to JSON string

        Job savedJob = jobRepository.save(job);
        log.info("Created job {} with status QUEUED", savedJob.getJobId());

        // Create job message for RabbitMQ
        JobMessageDTO message = new JobMessageDTO(
                savedJob.getJobId(),
                image.getImageId(),
                imageStoragePath, // This needs to be accessible by Python
                jobType,
                jobConfig
        );
        
        // Publish the job to RabbitMQ
        jobPublisherService.publishJob(message);
        log.info("Dispatched job {} to RabbitMQ", savedJob.getJobId());

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
            processedImage.setProcessedStoragePath(updateRequest.getProcessedStoragePath());
            
            // Extract filename from path
            String filename = updateRequest.getProcessedStoragePath();
            if (filename.contains("/")) {
                filename = filename.substring(filename.lastIndexOf('/') + 1);
            }
            processedImage.setProcessedFilename(filename);
            
            // Set placeholder values for filesize, width, height
            // TODO: These should be computed from the actual image file
            processedImage.setProcessedFilesizeBytes(10000L); // Placeholder
            processedImage.setProcessedWidth(800); // Placeholder
            processedImage.setProcessedHeight(600); // Placeholder
            processedImage.setProcessedFormat("PNG"); // Placeholder
            
            // Set processing parameters
            processedImage.setProcessingParams(updateRequest.getProcessingParams() != null ? 
                    convertMapToJsonString(updateRequest.getProcessingParams()) : null);
            
            // Save processed image
            processedImageRepository.save(processedImage);
            job.setProcessedImage(processedImage); // Link it back
        }
        log.info("Updating job {} to status {}", jobId, updateRequest.getStatus());
        return jobRepository.save(job);
    }

    public Job getJobStatus(UUID jobId) {
        return jobRepository.findById(jobId)
                .orElseThrow(() -> new EntityNotFoundException("Job not found with ID: " + jobId));
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
}