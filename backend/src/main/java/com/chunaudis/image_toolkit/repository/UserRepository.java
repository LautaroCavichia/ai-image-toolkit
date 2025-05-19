package com.chunaudis.image_toolkit.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.chunaudis.image_toolkit.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    
    /**
     * Find a user by their email address
     * @param email the email address to search for
     * @return Optional containing the user if found
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Check if a user exists with the given email
     * @param email the email address to check
     * @return true if a user exists with the email
     */
    boolean existsByEmail(String email);
    
    /**
     * Find a user by their display name
     * @param displayName the display name to search for
     * @return Optional containing the user if found
     */
    Optional<User> findByDisplayName(String displayName);
}
