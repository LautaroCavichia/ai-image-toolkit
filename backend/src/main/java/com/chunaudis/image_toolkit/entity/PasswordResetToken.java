package com.chunaudis.image_toolkit.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Data
public class PasswordResetToken {

    @Id
    @GeneratedValue
    private UUID id;

    private String token;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private OffsetDateTime expiration;

    private boolean used;
}
