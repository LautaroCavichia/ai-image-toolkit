package com.chunaudis.image_toolkit.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.chunaudis.image_toolkit.entity.ProcessedImage;

@Repository
public interface ProcessedImageRepository extends JpaRepository<ProcessedImage, UUID> {
    
    /**
     * Find all processed images for a given original image
     * @param originalImageId the UUID of the original image
     * @return List of processed images
     */
    List<ProcessedImage> findByOriginalImage_ImageId(UUID originalImageId);
    
    /**
     * Find a processed image by its associated job ID
     * @param jobId the UUID of the job
     * @return Optional containing the processed image if found
     */
    Optional<ProcessedImage> findByJob_JobId(UUID jobId);
    
    /**
     * Find all processed images for a given user
     * @param userId the UUID of the user
     * @return List of processed images
     */
    List<ProcessedImage> findByOriginalImage_User_UserId(UUID userId);
    
    /**
     * Check if a processed image exists for a given job
     * @param jobId the UUID of the job
     * @return true if a processed image exists for the job
     */
    boolean existsByJob_JobId(UUID jobId);
    
    /**
     * Delete all processed images for a given original image
     * @param originalImageId the UUID of the original image
     */
    void deleteByOriginalImage_ImageId(UUID originalImageId);
}
