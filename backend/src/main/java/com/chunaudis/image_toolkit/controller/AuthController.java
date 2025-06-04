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
import com.chunaudis.image_toolkit.service.PasswordResetService;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Map;


@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*") // Para desarrollo, restringir en producción
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final PasswordResetService passwordResetService;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil, PasswordResetService passwordResetService) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtUtil = jwtUtil;
    this.passwordResetService = passwordResetService;
}


    @Transactional
public void updateLastLoginTime(UUID userId) {
    userRepository.findById(userId).ifPresent(user -> {
        user.setLastLoginAt(OffsetDateTime.now());
        userRepository.save(user);
    });
}

@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody AuthRequestDTO authRequest) {
    try {
        log.info("Login attempt for email: {}", authRequest.getEmail());

        Optional<User> userOpt = userRepository.findByEmail(authRequest.getEmail());

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // 🔒 Chequeamos si está bloqueado
            if (user.isAccountLocked()) {
                OffsetDateTime lastFail = user.getLastFailedLogin();
                int attemptsOverThreshold = Math.max(0, user.getFailedLoginAttempts() - 4); // solo desde el 5to intento
                Duration lockDuration = Duration.ofMinutes(5L * attemptsOverThreshold);
                OffsetDateTime unlockTime = lastFail.plus(lockDuration);

                if (OffsetDateTime.now().isBefore(unlockTime)) {
                    Duration remaining = Duration.between(OffsetDateTime.now(), unlockTime);
                    long minutes = remaining.toMinutes();
                    long seconds = remaining.minusMinutes(minutes).getSeconds();

                    log.warn("Account is locked until {} for email: {}", unlockTime, user.getEmail());
                    return ResponseEntity.status(403).body(
                        String.format("Your account is locked due to too many failed login attempts. Try again in %d minutes and %d seconds.", minutes, seconds)
                    );
                } else {
                    // ⏱ Ya pasó el tiempo → desbloquear
                    user.setAccountLocked(false);
                    userRepository.save(user);
                    log.info("User {} unlocked after lock duration expired", user.getEmail());
                }
            }

            // ✅ Si la contraseña es correcta
            if (passwordEncoder.matches(authRequest.getPassword(), user.getPasswordHash())) {

                // Reset intentos fallidos
                user.setFailedLoginAttempts(0);
                user.setAccountLocked(false);

                // 👇 Si era guest, lo actualizamos a registrado
                if (user.getIsGuest()) {
                    user.setIsGuest(false);
                }

                updateLastLoginTime(user.getUserId());
                userRepository.save(user);

                String token = jwtUtil.generateToken(user.getUserId(), user.getEmail(), user.getIsGuest());

                return ResponseEntity.ok(new AuthResponseDTO(
                    token,
                    user.getUserId().toString(),
                    user.getEmail(),
                    user.getDisplayName(),
                    "Registered"
                ));
            } else {
                // ❌ Contraseña incorrecta → sumamos intento fallido
                int attempts = user.getFailedLoginAttempts() + 1;
                user.setFailedLoginAttempts(attempts);
                user.setLastFailedLogin(OffsetDateTime.now());

                if (attempts >= 5) {
                    user.setAccountLocked(true);
                    log.warn("User {} has been locked due to too many failed attempts", user.getEmail());
                }

                userRepository.save(user);
            }
        }

        return ResponseEntity.status(401).body("Invalid email or password");

    } catch (Exception e) {
        log.error("Login error", e);
        return ResponseEntity.internalServerError().body("Authentication failed");
    }
}



@PostMapping("/register")
public ResponseEntity<?> register(@RequestBody AuthRequestDTO registerRequest) {
    try {
        log.info("Registration attempt for email: {}", registerRequest.getEmail());

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Email already registered");
        }

        User user = new User();
        user.setEmail(registerRequest.getEmail());
        user.setPasswordHash(passwordEncoder.encode(registerRequest.getPassword()));
       user.setIsGuest(false);
        user.setDisplayName("User " + registerRequest.getEmail().split("@")[0]);
        

        User savedUser = userRepository.save(user);

        String token = jwtUtil.generateToken(savedUser.getUserId(), savedUser.getEmail(), savedUser.getIsGuest());

        return ResponseEntity.ok(new AuthResponseDTO(
            token,
            savedUser.getUserId().toString(),
            savedUser.getEmail(),
            savedUser.getDisplayName(),
            savedUser.getIsGuest() ? "Guest" : "Registered"
        ));

    } catch (Exception e) {
        log.error("Registration error", e);
        return ResponseEntity.internalServerError().body("Registration failed");
    }
}

@GetMapping("/create-test-user")
@Transactional
public ResponseEntity<?> createTestUser() {
    try {
        String testEmail = "test@example.com";
        String testPassword = "password123";

        Optional<User> existingUser = userRepository.findByEmail(testEmail);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            String token = jwtUtil.generateToken(user.getUserId(), user.getEmail(), user.getIsGuest());

            return ResponseEntity.ok(new AuthResponseDTO(
                token,
                user.getUserId().toString(),
                user.getEmail(),
                user.getDisplayName(),
                user.getIsGuest() ? "Guest" : "Test user"
            ));
        }

        User user = new User();
        user.setEmail(testEmail);
        user.setPasswordHash(passwordEncoder.encode(testPassword));
        user.setDisplayName("Test User");
        user.setIsGuest(false);

        User savedUser = userRepository.save(user);
        userRepository.flush();

        log.info("Created test user with ID: {}", savedUser.getUserId());

        String token = jwtUtil.generateToken(savedUser.getUserId(), savedUser.getEmail(), savedUser.getIsGuest());

        return ResponseEntity.ok(new AuthResponseDTO(
            token,
            savedUser.getUserId().toString(),
            savedUser.getEmail(),
            savedUser.getDisplayName(),
            savedUser.getIsGuest() ? "Guest" : "Test user"
        ));

    } catch (Exception e) {
        log.error("Test user creation error", e);
        return ResponseEntity.internalServerError().body("Test user creation failed: " + e.getMessage());
    }
}







}
