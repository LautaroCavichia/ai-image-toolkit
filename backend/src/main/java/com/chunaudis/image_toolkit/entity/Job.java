package com.chunaudis.image_toolkit.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;


import com.chunaudis.image_toolkit.entity.enums.JobStatusEnum;
import com.chunaudis.image_toolkit.entity.enums.JobTypeEnum;

import java.time.OffsetDateTime;
import java.util.UUID;


@Getter
@Setter
@Entity
@Table(name = "jobs")
public class Job {

    @Id
    private UUID jobId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "original_image_id", nullable = false)
    private Image originalImage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id") // Nullable
    private Batch batch;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private JobTypeEnum jobType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private JobStatusEnum status = JobStatusEnum.PENDING;

    private Integer priority;

    @JdbcTypeCode(SqlTypes.JSON) // For JSONB mapping to String or a custom type
    @Column(columnDefinition = "jsonb") // Explicitly define column type for Hibernate
    private String jobConfig; // Or Map<String, Object> with appropriate converter/Hibernate type

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private OffsetDateTime updatedAt;

    private OffsetDateTime startedAt;
    private OffsetDateTime completedAt;

    @OneToOne(mappedBy = "job", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private ProcessedImage processedImage;


    public Job() {
        this.jobId = UUID.randomUUID();
    }
}