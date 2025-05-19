package com.chunaudis.image_toolkit.controller;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chunaudis.image_toolkit.dto.JobResponseDTO;
import com.chunaudis.image_toolkit.dto.JobStatusUpdateRequestDTO;
import com.chunaudis.image_toolkit.entity.Job;
import com.chunaudis.image_toolkit.service.JobService;

@RestController
@RequestMapping("/api/v1/jobs")

@CrossOrigin(origins = "*") // FIXME: Allow all for dev, restrict in prod!
public class JobController {
private static final Logger log = LoggerFactory.getLogger(JobController.class);
private final JobService jobService;

public JobController(JobService jobService) {
    this.jobService = jobService;
}

// Endpoint for Python microservice to call back
@PostMapping("/{jobId}/status")
public ResponseEntity<Void> updateJobStatus(
        @PathVariable UUID jobId,
        @RequestBody JobStatusUpdateRequestDTO updateRequest) {
    log.info("Received status update for job {}: {}", jobId, updateRequest.getStatus());
    try {
        jobService.updateJobStatus(jobId, updateRequest);
        return ResponseEntity.ok().build();
    } catch (Exception e) {
        log.error("Error updating job status for job {}: ", jobId, e);
        return ResponseEntity.internalServerError().build();
    }
}

// Endpoint for frontend to poll job status
@GetMapping("/{jobId}/status")
public ResponseEntity<JobResponseDTO> getJobStatus(@PathVariable UUID jobId) {
    try {
        Job job = jobService.getJobStatus(jobId);
        JobResponseDTO response = mapJobToJobResponseDTO(job); // Use the same mapper
        return ResponseEntity.ok(response);
    } catch (jakarta.persistence.EntityNotFoundException e) {
        return ResponseEntity.notFound().build();
    } catch (Exception e) {
        log.error("Error fetching job status for job {}: ", jobId, e);
        return ResponseEntity.internalServerError().build();
    }
}

 // TODO: (can be moved to a common mapper class)
private JobResponseDTO mapJobToJobResponseDTO(Job job) {
    JobResponseDTO dto = new JobResponseDTO();
    dto.setJobId(job.getJobId());
    if (job.getOriginalImage() != null) {
        dto.setOriginalImageId(job.getOriginalImage().getImageId());
    }
    dto.setJobType(job.getJobType());
    dto.setStatus(job.getStatus());
    dto.setCreatedAt(job.getCreatedAt());
    dto.setCompletedAt(job.getCompletedAt());
    if (job.getProcessedImage() != null) {
        // For local FS, this path might not be directly servable to frontend.
        // For cloud, this will be the direct URL.
        dto.setProcessedImageUrl(job.getProcessedImage().getProcessedStoragePath());
    }
    dto.setErrorMessage(job.getErrorMessage());
    return dto;
}
}