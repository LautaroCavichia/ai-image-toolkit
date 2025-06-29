package com.chunaudis.image_toolkit.repository;

import com.chunaudis.image_toolkit.entity.EmailVerificationToken;
import com.chunaudis.image_toolkit.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, UUID> {
    
    Optional<EmailVerificationToken> findByTokenAndUsedFalse(String token);
    
    List<EmailVerificationToken> findByUserAndUsedFalse(User user);
    
    void deleteByExpirationBefore(OffsetDateTime now);
    
    void deleteByUser(User user);
}