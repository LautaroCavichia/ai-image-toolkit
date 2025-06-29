package com.chunaudis.image_toolkit.controller;

import com.chunaudis.image_toolkit.service.EmailService;
import com.chunaudis.image_toolkit.service.PasswordResetService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
public class PasswordResetController {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetController.class);

    private final PasswordResetService passwordResetService;
    private final EmailService emailService;  

  
    public PasswordResetController(
        PasswordResetService passwordResetService,
        EmailService emailService
    ) {
        this.passwordResetService = passwordResetService;
        this.emailService = emailService;
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email is required"));
        }

        Optional<String> tokenOpt = passwordResetService.createPasswordResetToken(email);

        if (tokenOpt.isPresent()) {
            String token = tokenOpt.get();
            log.info("Generated password reset token for {}: {}", email, token);
            
            // ENVIAR EL CORREO CON EL TOKEN
            emailService.sendPasswordResetEmail(email, token);
            
            // Mensaje genérico de éxito (no incluir el token en la respuesta)
            return ResponseEntity.ok(Map.of("message", "Si el email existe, se ha enviado un enlace de recuperación"));
        } else {
            log.warn("Password reset requested for non-existing or already active token for email: {}", email);
            return ResponseEntity.status(200)
                    .body(Map.of("message", "Si el email existe, se ha enviado un enlace de recuperación"));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String newPassword = body.get("newPassword");

        if (token == null || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body("Token and new password are required");
        }

        boolean result = passwordResetService.resetPassword(token, newPassword);

        if (result) {
            return ResponseEntity.ok(Map.of("message", "Password reset successful"));
        } else {
            return ResponseEntity.status(400).body("Invalid or expired token");
        }
    }
}