package com.chunaudis.image_toolkit.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "processed_images")
public class ProcessedImage {

    @Id
    private UUID processedImageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "original_image_id", nullable = false)
    private Image originalImage;

    @OneToOne(fetch = FetchType.LAZY) // One processed image belongs to one job
    @JoinColumn(name = "job_id", nullable = false, unique = true)
    private Job job;

    @Column(nullable = false, length = 1024)
    private String processedStoragePath;

    @Column(nullable = false, length = 50)
    private String processedFilename;

    @Column(nullable = false)
    private Long processedFilesizeBytes;

    @Column(nullable = false, length = 10)
    private String processedFormat;

    @Column(nullable = false)
    private Integer processedWidth;

    @Column(nullable = false)
    private Integer processedHeight;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String processingParams; 

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    public ProcessedImage() {
        this.processedImageId = UUID.randomUUID();
    }
}