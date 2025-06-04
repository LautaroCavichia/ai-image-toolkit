package com.chunaudis.image_toolkit.repository;

import com.chunaudis.image_toolkit.entity.PasswordResetToken;
import com.chunaudis.image_toolkit.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {
    Optional<PasswordResetToken> findByToken(String token);
    void deleteByUser(User user);
}
