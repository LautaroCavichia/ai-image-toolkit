package com.chunaudis.image_toolkit.repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.chunaudis.image_toolkit.entity.Job;
import com.chunaudis.image_toolkit.entity.enums.JobStatusEnum;

@Repository
public interface JobRepository extends JpaRepository<Job, UUID> {
    
    /**
     * Find jobs by user ID with pagination
     * @param userId the user ID
     * @param pageable pagination parameters
     * @return List of jobs
     */
    List<Job> findByUserUserId(UUID userId, Pageable pageable);
    
    /**
     * Find jobs by user ID created after a specific date
     * @param userId the user ID
     * @param createdAfter the cutoff date
     * @param pageable pagination parameters
     * @return List of jobs
     */
    List<Job> findByUserUserIdAndCreatedAtAfter(UUID userId, OffsetDateTime createdAfter, Pageable pageable);
    
    /**
     * Find jobs by user ID and status
     * @param userId the user ID
     * @param status the job status
     * @param pageable pagination parameters
     * @return List of jobs
     */
    List<Job> findByUserUserIdAndStatus(UUID userId, JobStatusEnum status, Pageable pageable);
    
    /**
     * Count total jobs for a user
     * @param userId the user ID
     * @return count of jobs
     */
    long countByUserUserId(UUID userId);
    
    /**
     * Count jobs by user ID and status
     * @param userId the user ID
     * @param status the job status
     * @return count of jobs
     */
    long countByUserUserIdAndStatus(UUID userId, JobStatusEnum status);
    
    /**
     * Find jobs by user ID created within date range
     * @param userId the user ID
     * @param startDate start of date range
     * @param endDate end of date range
     * @param pageable pagination parameters
     * @return List of jobs
     */
    @Query("SELECT j FROM Job j WHERE j.user.userId = :userId AND j.createdAt BETWEEN :startDate AND :endDate ORDER BY j.createdAt DESC")
    List<Job> findByUserUserIdAndCreatedAtBetween(
        @Param("userId") UUID userId, 
        @Param("startDate") OffsetDateTime startDate, 
        @Param("endDate") OffsetDateTime endDate, 
        Pageable pageable
    );
    
    /**
     * Find completed jobs by user ID in the last N days
     * @param userId the user ID
     * @param cutoffDate the cutoff date
     * @param pageable pagination parameters
     * @return List of completed jobs
     */
    @Query("SELECT j FROM Job j WHERE j.user.userId = :userId AND j.status = 'COMPLETED' AND j.createdAt >= :cutoffDate ORDER BY j.createdAt DESC")
    List<Job> findCompletedJobsByUserIdSince(
        @Param("userId") UUID userId, 
        @Param("cutoffDate") OffsetDateTime cutoffDate, 
        Pageable pageable
    );
    
    /**
     * Find jobs with processed images by user ID
     * @param userId the user ID
     * @param pageable pagination parameters
     * @return List of jobs with processed images
     */
    @Query("SELECT j FROM Job j LEFT JOIN FETCH j.processedImage WHERE j.user.userId = :userId AND j.processedImage IS NOT NULL ORDER BY j.createdAt DESC")
    List<Job> findJobsWithProcessedImagesByUserId(@Param("userId") UUID userId, Pageable pageable);
    
    /**
     * Delete old jobs for guest users (cleanup)
     * @param cutoffDate jobs older than this date will be deleted
     * @param isGuest whether to target guest users only
     */
    @Query("DELETE FROM Job j WHERE j.user.isGuest = :isGuest AND j.createdAt < :cutoffDate")
    void deleteOldGuestJobs(@Param("isGuest") Boolean isGuest, @Param("cutoffDate") OffsetDateTime cutoffDate);
}