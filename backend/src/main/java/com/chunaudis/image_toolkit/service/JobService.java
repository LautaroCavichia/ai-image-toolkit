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
    private final ProcessedImageRepository processedImageRepository; // TODO: Autowire this
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

    @Transactional // Ensure DB operations are atomic
    public Job createAndDispatchJob(Image image, JobTypeEnum jobType, String imageStoragePath, Map<String, Object> jobConfig, UUID userId) {
        // User user = userRepository.findById(userId)
        //         .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

        // FIXME: For now, use a dummy user
        User user = new User();
        user.setUserId(userId);

        // save user so we have a user id and can link the job and image
        userRepository.save(user);

        Job job = new Job();
        job.setUser(user);
        job.setOriginalImage(image);
        job.setJobType(jobType);
        job.setStatus(JobStatusEnum.QUEUED); // Set to QUEUED as it's about to be published
        job.setJobConfig(jobConfig != null ? convertMapToJsonString(jobConfig) : null); // Convert Map to JSON string
        // job.setBatch(batch); // if part of a batch

        Job savedJob = jobRepository.save(job);
        log.info("Created job {} with status QUEUED", savedJob.getJobId());

        JobMessageDTO message = new JobMessageDTO(
                savedJob.getJobId(),
                image.getImageId(),
                imageStoragePath, // This needs to be accessible by Python
                jobType,
                jobConfig
        );
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
            ProcessedImage processedImage = new ProcessedImage();
            processedImage.setJob(job);
            processedImage.setOriginalImage(job.getOriginalImage());
            processedImage.setProcessedStoragePath(updateRequest.getProcessedStoragePath());
            // Assuming filename can be derived or is part of the path for now
            // FIXME: might need more info from Python service to populate all processed_image fields
            processedImage.setProcessedFilename("processed_" + job.getJobId().toString()); // Placeholder
            processedImage.setProcessingParams(updateRequest.getProcessingParams() != null ? convertMapToJsonString(updateRequest.getProcessingParams()) : null);
            // Set other fields like filesize, format, width, height if available
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
            return null; // FIXME: handle better
        }
    }
}