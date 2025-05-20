package com.chunaudis.image_toolkit.controller;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chunaudis.image_toolkit.dto.AuthRequestDTO;
import com.chunaudis.image_toolkit.dto.AuthResponseDTO;
import com.chunaudis.image_toolkit.entity.User;
import com.chunaudis.image_toolkit.repository.UserRepository;
import com.chunaudis.image_toolkit.security.JwtUtil;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*") // For development - restrict in production
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequestDTO authRequest) {
        try {
            log.info("Login attempt for email: {}", authRequest.getEmail());
            
            // Find user by email
            Optional<User> userOpt = userRepository.findByEmail(authRequest.getEmail());
            
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                
                // Check password
                if (passwordEncoder.matches(authRequest.getPassword(), user.getPasswordHash())) {
                    // Generate JWT token
                    String token = jwtUtil.generateToken(user.getUserId(), user.getEmail());
                    
                    // Update last login time - in a separate transaction to avoid conflicts
                    updateLastLoginTime(user.getUserId());
                    
                    // Return token and user details
                    return ResponseEntity.ok(new AuthResponseDTO(
                            token, 
                            user.getUserId().toString(),
                            user.getEmail(),
                            user.getDisplayName()));
                }
            }
            
            // Invalid credentials
            return ResponseEntity.status(401).body("Invalid email or password");
            
        } catch (Exception e) {
            log.error("Login error", e);
            return ResponseEntity.internalServerError().body("Authentication failed");
        }
    }

    @Transactional
    protected void updateLastLoginTime(UUID userId) {
        try {
            userRepository.findById(userId).ifPresent(user -> {
                user.setLastLoginAt(OffsetDateTime.now());
                userRepository.save(user);
            });
        } catch (Exception e) {
            log.warn("Could not update last login time for user {}: {}", userId, e.getMessage());
            // Non-critical operation, so we can continue even if this fails
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequestDTO registerRequest) {
        try {
            log.info("Registration attempt for email: {}", registerRequest.getEmail());
            
            // Check if email already exists
            if (userRepository.existsByEmail(registerRequest.getEmail())) {
                return ResponseEntity.badRequest().body("Email already registered");
            }
            
            // Create new user
            User user = new User();
            // Let the entity class generate the UUID
            user.setEmail(registerRequest.getEmail());
            user.setPasswordHash(passwordEncoder.encode(registerRequest.getPassword()));
            user.setDisplayName("User " + registerRequest.getEmail().split("@")[0]); // Simple display name
            
            // Save user
            User savedUser = userRepository.save(user);
            
            // Generate JWT token
            String token = jwtUtil.generateToken(savedUser.getUserId(), savedUser.getEmail());
            
            // Return token and user details
            return ResponseEntity.ok(new AuthResponseDTO(
                    token, 
                    savedUser.getUserId().toString(),
                    savedUser.getEmail(),
                    savedUser.getDisplayName()));
            
        } catch (Exception e) {
            log.error("Registration error", e);
            return ResponseEntity.internalServerError().body("Registration failed");
        }
    }
    
    // For testing purposes - create a test user if one doesn't exist
    @GetMapping("/create-test-user")
    @Transactional
    public ResponseEntity<?> createTestUser() {
        try {
            String testEmail = "test@example.com";
            String testPassword = "password123";
            
            // Check if test user already exists
            Optional<User> existingUser = userRepository.findByEmail(testEmail);
            if (existingUser.isPresent()) {
                User user = existingUser.get();
                String token = jwtUtil.generateToken(user.getUserId(), user.getEmail());
                return ResponseEntity.ok(new AuthResponseDTO(
                        token, 
                        user.getUserId().toString(),
                        user.getEmail(),
                        user.getDisplayName()));
            }
            
            // Create test user - let the entity generate its own UUID
            User user = new User();
            user.setEmail(testEmail);
            user.setPasswordHash(passwordEncoder.encode(testPassword));
            user.setDisplayName("Test User");
            
            // Save user
            User savedUser = userRepository.save(user);
            
            // Flush to ensure the entity is saved to the database
            userRepository.flush();
            
            log.info("Created test user with ID: {}", savedUser.getUserId());
            
            // Generate JWT token
            String token = jwtUtil.generateToken(savedUser.getUserId(), savedUser.getEmail());
            
            // Return token and user details
            return ResponseEntity.ok(new AuthResponseDTO(
                    token, 
                    savedUser.getUserId().toString(),
                    savedUser.getEmail(),
                    savedUser.getDisplayName()));
            
        } catch (Exception e) {
            log.error("Test user creation error", e);
            return ResponseEntity.internalServerError().body("Test user creation failed: " + e.getMessage());
        }
    }
}