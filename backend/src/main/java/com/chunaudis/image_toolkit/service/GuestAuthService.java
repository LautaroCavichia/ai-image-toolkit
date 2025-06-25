package com.chunaudis.image_toolkit.service;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chunaudis.image_toolkit.dto.GuestAuthResponseDTO;
import com.chunaudis.image_toolkit.entity.User;
import com.chunaudis.image_toolkit.repository.UserRepository;
import com.chunaudis.image_toolkit.security.JwtUtil;

@Service
public class GuestAuthService {
    
    private static final Logger log = LoggerFactory.getLogger(GuestAuthService.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    
    public GuestAuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }
    
    @Transactional
    public GuestAuthResponseDTO createGuestUser() {
        try {
            // Create a random guest email that won't conflict
            String guestEmail = "guest-" + UUID.randomUUID().toString() + "@pixelperfect.ai";
            String displayName = "Guest User";
            
            // Create a random secure password
            String randomPassword = UUID.randomUUID().toString();
            String passwordHash = passwordEncoder.encode(randomPassword);
            
            // Create and save guest user
            User guestUser = new User();
            guestUser.setEmail(guestEmail);
            guestUser.setPasswordHash(passwordHash);
            guestUser.setDisplayName(displayName);
            guestUser.setIsGuest(true);
            guestUser.setTokenBalance(0);
            
            // Save user only once
            User savedUser = userRepository.save(guestUser);
            log.info("Created guest user with ID: {}", savedUser.getUserId());
            
            // Generate JWT token
       String token = jwtUtil.generateToken(savedUser.getUserId(), savedUser.getEmail(), savedUser.getIsGuest());

return new GuestAuthResponseDTO(
    token,
    savedUser.getUserId().toString(),
    savedUser.getDisplayName(),
    true,
    savedUser.getTokenBalance()
);

            
        } catch (Exception e) {
            log.error("Failed to create guest user", e);
            throw new RuntimeException("Failed to create guest user", e);
        }
    }
    
    @Transactional
    public boolean convertGuestToRegistered(UUID userId, String email, String password, String displayName) {
        try {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Only allow conversion of guest accounts
            if (!user.getIsGuest()) {
                return false;
            }
            
            // Check if email is already taken by a non-guest account
            if (userRepository.existsByEmail(email)) {
                return false;
            }
            
            // Update user details
            user.setEmail(email);
            user.setPasswordHash(passwordEncoder.encode(password));
            user.setDisplayName(displayName);
            user.setIsGuest(false);
            
            userRepository.save(user);
            return true;
            
        } catch (Exception e) {
            log.error("Failed to convert guest to registered user", e);
            return false;
        }
    }
}