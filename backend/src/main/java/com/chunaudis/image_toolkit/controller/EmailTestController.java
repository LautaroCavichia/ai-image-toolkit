package com.chunaudis.image_toolkit.controller;

import com.chunaudis.image_toolkit.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/email-test")
@CrossOrigin(origins = "*")
public class EmailTestController {

    private static final Logger log = LoggerFactory.getLogger(EmailTestController.class);

    @Autowired
    private EmailService emailService;

    @Value("${spring.mail.username:NOT_SET}")
    private String mailUsername;

    @Value("${spring.mail.password:NOT_SET}")
    private String mailPassword;

    @Value("${spring.mail.host:NOT_SET}")
    private String mailHost;

    @Value("${spring.mail.port:NOT_SET}")
    private String mailPort;

    @GetMapping("/config")
    public ResponseEntity<?> getEmailConfig() {
        log.info("=== EMAIL CONFIGURATION DEBUG ===");
        
        Map<String, Object> config = Map.of(
            "host", mailHost,
            "port", mailPort,
            "username", mailUsername,
            "passwordSet", !mailPassword.equals("NOT_SET") && mailPassword != null,
            "passwordLength", mailPassword != null ? mailPassword.length() : 0,
            "passwordPreview", mailPassword != null && !mailPassword.equals("NOT_SET") ? 
                mailPassword.substring(0, Math.min(4, mailPassword.length())) + "****" : "NOT_SET"
        );

        log.info("Email Config: {}", config);
        
        return ResponseEntity.ok(config);
    }

    @PostMapping("/send")
    public ResponseEntity<?> testSendEmail(@RequestBody Map<String, String> request) {
        String testEmail = request.get("email");
        
        if (testEmail == null || testEmail.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Email address is required"
            ));
        }

        try {
            log.info("=== TESTING EMAIL SEND ===");
            emailService.sendEmailVerificationEmail(testEmail, "TEST_TOKEN_123");
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Test email sent successfully to " + testEmail
            ));
            
        } catch (Exception e) {
            log.error("Test email failed", e);
            
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", e.getClass().getSimpleName(),
                "message", e.getMessage()
            ));
        }
    }
}