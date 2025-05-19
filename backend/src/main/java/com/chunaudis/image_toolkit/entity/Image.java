package com.chunaudis.image_toolkit.entity;

import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "images")
public class Image {

    @Id
    private UUID imageId;

    @ManyToOne(fetch = FetchType.LAZY) // LAZY is often better for performance
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 1024) 
    private String originalStoragePath;

    @Column(nullable = false, length = 50)
    private String originalFilename;

    @Column(nullable = false)
    private Long originalFilesizeBytes;

    @Column(nullable = false, length = 10)
    private String originalFormat;

    @Column(nullable = false)
    private Integer originalWidth;

    @Column(nullable = false)
    private Integer originalHeight;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private OffsetDateTime uploadedAt;


    @OneToMany(mappedBy = "originalImage", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Job> jobs;


    @OneToMany(mappedBy = "originalImage", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ProcessedImage> processedImages;


    public Image() {
        this.imageId = UUID.randomUUID();
    }
}