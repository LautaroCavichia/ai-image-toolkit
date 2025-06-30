package com.chunaudis.image_toolkit.controller;

import com.chunaudis.image_toolkit.service.EmailVerificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/email-verification")
@CrossOrigin(origins = "*")
public class EmailVerificationController {

    private static final Logger log = LoggerFactory.getLogger(EmailVerificationController.class);

    @Autowired
    private EmailVerificationService emailVerificationService;

    @PostMapping("/verify")
    public ResponseEntity<?> verifyEmail(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            
            if (token == null || token.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "INVALID_TOKEN",
                    "message", "Verification token is required"
                ));
            }

            boolean isVerified = emailVerificationService.verifyEmail(token);
            
            if (isVerified) {
                log.info("Email verification successful for token: {}", token.substring(0, 8) + "...");
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Email verified successfully! You can now log in to your account."
                ));
            } else {
                log.warn("Email verification failed for token: {}", token.substring(0, 8) + "...");
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "VERIFICATION_FAILED",
                    "message", "Invalid or expired verification token"
                ));
            }

        } catch (Exception e) {
            log.error("Email verification error", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "INTERNAL_ERROR",
                "message", "An error occurred during email verification"
            ));
        }
    }

    @PostMapping("/resend")
    public ResponseEntity<?> resendVerificationEmail(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "INVALID_EMAIL",
                    "message", "Email address is required"
                ));
            }

            emailVerificationService.resendVerificationEmail(email);
            
            
            log.info("Verification email resent for: {}", email);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Verification email has been sent to your email address."
            ));

        } catch (Exception e) {
            log.error("Resend verification email error", e);
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "INTERNAL_ERROR", 
                "message", "An error occurred while sending verification email"
            ));
        }
    }
}