package com.chunaudis.image_toolkit.service;

import com.chunaudis.image_toolkit.entity.ProcessedImage;
import com.chunaudis.image_toolkit.repository.ProcessedImageRepository;
import com.chunaudis.image_toolkit.storage.CloudinaryStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class CloudinaryCleanupService {

    @Autowired
    private ProcessedImageRepository processedImageRepository;

    @Autowired
    private CloudinaryStorageService cloudinaryStorageService;

    /**
     * Schedule deletion for non-premium images (immediately after download simulation)
     * In real implementation, this would be called when user downloads the free version
     */
    public void scheduleImmediateDeletion(UUID processedImageId) {
        ProcessedImage image = processedImageRepository.findById(processedImageId).orElse(null);
        if (image != null && !image.getIsPremium()) {
            // Schedule for deletion in 1 hour (giving user time to download)
            image.setScheduledDeletionAt(OffsetDateTime.now().plusHours(1));
            processedImageRepository.save(image);
            log.info("Scheduled immediate deletion for non-premium image: {}", processedImageId);
        }
    }

    /**
     * Schedule deletion for premium images (30 days)
     */
    public void schedulePremiumDeletion(UUID processedImageId) {
        ProcessedImage image = processedImageRepository.findById(processedImageId).orElse(null);
        if (image != null && image.getIsPremium()) {
            image.setScheduledDeletionAt(OffsetDateTime.now().plusDays(30));
            processedImageRepository.save(image);
            log.info("Scheduled 30-day deletion for premium image: {}", processedImageId);
        }
    }

    /**
     * Run cleanup every hour
     */
    @Scheduled(fixedRate = 3600000) // 1 hour in milliseconds
    @Transactional
    public void cleanupExpiredImages() {
        OffsetDateTime now = OffsetDateTime.now();
        
        // Find all images scheduled for deletion that have passed their deletion time
        List<ProcessedImage> imagesToDelete = processedImageRepository.findByScheduledDeletionAtBefore(now);
        
        log.info("Found {} images to delete", imagesToDelete.size());
        
        for (ProcessedImage image : imagesToDelete) {
            try {
                // Delete from Cloudinary
                if (image.getCloudinaryPublicId() != null) {
                    cloudinaryStorageService.deleteImage(image.getCloudinaryPublicId());
                } else {
                    // Fallback: extract public ID from URL
                    String publicId = cloudinaryStorageService.extractPublicId(image.getProcessedStoragePath());
                    if (publicId != null) {
                        cloudinaryStorageService.deleteImage(publicId);
                    }
                }
                
                // Delete from database
                processedImageRepository.delete(image);
                
                log.info("Successfully deleted expired image: {}", image.getProcessedImageId());
                
            } catch (Exception e) {
                log.error("Failed to delete expired image: {}", image.getProcessedImageId(), e);
            }
        }
    }

    /**
     * Emergency cleanup - delete very old images regardless of schedule
     * Run daily at 2 AM
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void emergencyCleanup() {
        OffsetDateTime cutoff = OffsetDateTime.now().minusDays(45); // 45 days old
        
        List<ProcessedImage> oldImages = processedImageRepository.findByCreatedAtBefore(cutoff);
        
        log.info("Emergency cleanup: found {} very old images", oldImages.size());
        
        for (ProcessedImage image : oldImages) {
            try {
                // Delete from Cloudinary
                if (image.getCloudinaryPublicId() != null) {
                    cloudinaryStorageService.deleteImage(image.getCloudinaryPublicId());
                } else {
                    String publicId = cloudinaryStorageService.extractPublicId(image.getProcessedStoragePath());
                    if (publicId != null) {
                        cloudinaryStorageService.deleteImage(publicId);
                    }
                }
                
                // Delete from database
                processedImageRepository.delete(image);
                
                log.info("Emergency cleanup: deleted old image: {}", image.getProcessedImageId());
                
            } catch (Exception e) {
                log.error("Emergency cleanup failed for image: {}", image.getProcessedImageId(), e);
            }
        }
    }
}