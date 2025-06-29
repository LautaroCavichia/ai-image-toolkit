package com.chunaudis.image_toolkit.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Data
public class EmailVerificationToken {

    @Id
    @GeneratedValue
    private UUID id;

    private String token;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private OffsetDateTime expiration;

    private boolean used;

    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = OffsetDateTime.now();
        this.expiration = OffsetDateTime.now().plusHours(24); // 24-hour expiration
    }
}