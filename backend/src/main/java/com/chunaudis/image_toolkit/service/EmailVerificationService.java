package com.chunaudis.image_toolkit.service;

import com.chunaudis.image_toolkit.entity.EmailVerificationToken;
import com.chunaudis.image_toolkit.entity.User;
import com.chunaudis.image_toolkit.repository.EmailVerificationTokenRepository;
import com.chunaudis.image_toolkit.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class EmailVerificationService {

    @Autowired
    private EmailVerificationTokenRepository tokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Transactional
    public void sendVerificationEmail(User user) {
        // Invalidate any existing tokens for this user
        List<EmailVerificationToken> existingTokens = tokenRepository.findByUserAndUsedFalse(user);
        existingTokens.forEach(token -> {
            token.setUsed(true);
            tokenRepository.save(token);
        });

        // Generate new verification token
        String token = UUID.randomUUID().toString();
        
        EmailVerificationToken verificationToken = new EmailVerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUser(user);
        verificationToken.setUsed(false);
        
        tokenRepository.save(verificationToken);

        // Send email
        emailService.sendEmailVerificationEmail(user.getEmail(), token);
    }

    @Transactional
public boolean verifyEmail(String token) {
    Optional<EmailVerificationToken> optionalToken = tokenRepository.findByTokenAndUsedFalse(token);
    
    if (optionalToken.isEmpty()) {
        return false;
    }

    EmailVerificationToken verificationToken = optionalToken.get();
    
    // Check if token has expired
    if (verificationToken.getExpiration().isBefore(OffsetDateTime.now())) {
        return false;
    }

    // Mark token as used
    verificationToken.setUsed(true);
    tokenRepository.save(verificationToken);


    // Mark user as email verified
    User user = verificationToken.getUser();
    user.setEmailVerified(true);
    user.setEmailVerifiedAt(OffsetDateTime.now());
    userRepository.save(user);

    return true;
}

    @Transactional
    public void cleanupExpiredTokens() {
        tokenRepository.deleteByExpirationBefore(OffsetDateTime.now());
    }

    public boolean isEmailVerified(User user) {
        return user.getEmailVerified() != null && user.getEmailVerified();
    }

    @Transactional
    public void resendVerificationEmail(String email) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (!isEmailVerified(user)) {
                sendVerificationEmail(user);
            }
        }
    }
}