package com.chunaudis.image_toolkit.entity;

import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "user_id", updatable = false, nullable = false)
    private UUID userId;

    @Column(unique = true, nullable = false, length = 255)
    private String email;

    @Column(nullable = false, length = 255)
    private String passwordHash;

    @Column(length = 100)
    private String displayName;

    // New field: isGuest flag
    @Column(nullable = false)
    private Boolean isGuest = false;
    
    // New field: tokenBalance for premium features
    @Column(nullable = false)
    private Integer tokenBalance = 0;

    // Email verification fields
    @Column(nullable = false)
    private Boolean emailVerified = false;

    private OffsetDateTime emailVerifiedAt;

    @CreationTimestamp 
    @Column(nullable = false, updatable = false) 
    private OffsetDateTime createdAt;

    private OffsetDateTime lastLoginAt;

    // Version for optimistic locking
    @Version
    private Integer version;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Image> images;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Job> jobs;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Batch> batches;


    @Column(nullable = false)
    private int failedLoginAttempts = 0;

    private OffsetDateTime lastFailedLogin;

    @Column(nullable = false)
    private boolean accountLocked = false;

    // Default constructor (required by JPA)
    public User() {
        // Let JPA/Hibernate generate the UUID
    }
}