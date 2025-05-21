package com.chunaudis.image_toolkit.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chunaudis.image_toolkit.dto.GuestAuthResponseDTO;
import com.chunaudis.image_toolkit.service.GuestAuthService;

import lombok.Data;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*") // For development - restrict in production
public class GuestAuthController {
    
    private final GuestAuthService guestAuthService;
    
    public GuestAuthController(GuestAuthService guestAuthService) {
        this.guestAuthService = guestAuthService;
    }
    
    @PostMapping("/guest")
    public ResponseEntity<GuestAuthResponseDTO> createGuestUser() {
        GuestAuthResponseDTO response = guestAuthService.createGuestUser();
        return ResponseEntity.ok(response);
    }
    
    @Data
    public static class GuestConversionRequest {
        private String userId;
        private String email;
        private String password;
        private String displayName;
    }
    
    @PostMapping("/convert-guest")
    public ResponseEntity<?> convertGuestToRegistered(@RequestBody GuestConversionRequest request) {
        try {
            UUID userId = UUID.fromString(request.getUserId());
            boolean success = guestAuthService.convertGuestToRegistered(
                userId, 
                request.getEmail(), 
                request.getPassword(), 
                request.getDisplayName()
            );
            
            if (success) {
                return ResponseEntity.ok().body("Guest account converted successfully");
            } else {
                return ResponseEntity.badRequest().body("Failed to convert guest account");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid request: " + e.getMessage());
        }
    }
}