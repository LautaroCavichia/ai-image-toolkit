package com.chunaudis.image_toolkit.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

import com.chunaudis.image_toolkit.entity.enums.BatchStatusEnum;

@Getter
@Setter
@Entity
@Table(name = "batches")
public class Batch {

    @Id
    private UUID batchId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(length = 255)
    private String batchName;

    @Enumerated(EnumType.STRING) 
    @Column(nullable = false, length = 50) 
    private BatchStatusEnum status = BatchStatusEnum.PENDING; 

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "batch", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Job> jobs;

    public Batch() {
        this.batchId = UUID.randomUUID();
    }
}