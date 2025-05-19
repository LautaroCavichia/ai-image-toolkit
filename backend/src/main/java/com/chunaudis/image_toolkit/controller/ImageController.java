package com.chunaudis.image_toolkit.controller;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.chunaudis.image_toolkit.dto.ImageUploadRequestDTO;   
import com.chunaudis.image_toolkit.dto.JobResponseDTO;
import com.chunaudis.image_toolkit.entity.Job;
import com.chunaudis.image_toolkit.entity.enums.JobTypeEnum;
import com.chunaudis.image_toolkit.service.ImageService;

@RestController
@RequestMapping("/api/v1/images")
@CrossOrigin(origins = "*") // FIXME: Allow all for dev, restrict in prod!
public class ImageController {
    private static final Logger log = LoggerFactory.getLogger(ImageController.class);
    private final ImageService imageService;

    public ImageController(ImageService imageService) {
        this.imageService = imageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<JobResponseDTO> uploadImageAndCreateJob(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") String userId, // TODO: Get from auth principal
            @RequestParam("jobType") JobTypeEnum jobType
    ) {
        log.info("Received image upload request for user: {}, jobType: {}", userId, jobType);
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build(); // FIXME: Or a custom error DTO
        }

        ImageUploadRequestDTO requestDTO = new ImageUploadRequestDTO();
        requestDTO.setUserId(userId);
        requestDTO.setJobType(jobType);

        // Example jobConfig, this could come from request params or a JSON body part
        Map<String, Object> jobConfig = new HashMap<>();
        if (jobType == JobTypeEnum.UPSCALE) {
            jobConfig.put("scaleFactor", 2); // FIXME: Example
        }

        try {
            Job createdJob = imageService.processUploadedImage(file, requestDTO, jobConfig);
            JobResponseDTO response = mapJobToJobResponseDTO(createdJob);
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
        } catch (Exception e) {
            log.error("Error processing image upload: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Helper to map Job entity to DTO
    private JobResponseDTO mapJobToJobResponseDTO(Job job) {
        JobResponseDTO dto = new JobResponseDTO();
        dto.setJobId(job.getJobId());
        dto.setOriginalImageId(job.getOriginalImage().getImageId());
        dto.setJobType(job.getJobType());
        dto.setStatus(job.getStatus());
        dto.setCreatedAt(job.getCreatedAt());
        dto.setCompletedAt(job.getCompletedAt());
        if (job.getProcessedImage() != null) {
            dto.setProcessedImageUrl(job.getProcessedImage().getProcessedStoragePath()); // This will be a cloud URL later
        }
        dto.setErrorMessage(job.getErrorMessage());
        return dto;
    }
}