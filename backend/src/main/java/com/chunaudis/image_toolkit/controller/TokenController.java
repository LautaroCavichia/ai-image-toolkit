package com.chunaudis.image_toolkit.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chunaudis.image_toolkit.service.TokenService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.Data;

@RestController
@RequestMapping("/api/v1/tokens")
@CrossOrigin(origins = "*") // For development - restrict in production
public class TokenController {
    
    private final TokenService tokenService;
    
    public TokenController(TokenService tokenService) {
        this.tokenService = tokenService;
    }
    
    @GetMapping("/balance")
    public ResponseEntity<?> getTokenBalance(HttpServletRequest request) {
        UUID userId = (UUID) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        
        int balance = tokenService.getTokenBalance(userId);
        
        return ResponseEntity.ok().body(new TokenBalanceResponse(balance));
    }
    
    @Data
    public static class TokenBalanceResponse {
        private int balance;
        
        public TokenBalanceResponse(int balance) {
            this.balance = balance;
        }
    }
    
    @Data
    public static class TokenPurchaseRequest {
        private int amount;
    }
    
    @PostMapping("/purchase")
    public ResponseEntity<?> purchaseTokens(@RequestBody TokenPurchaseRequest request, HttpServletRequest httpRequest) {
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        
        // TODO: Implement token purchase logic
        tokenService.addTokens(userId, request.getAmount());
        
        int newBalance = tokenService.getTokenBalance(userId);
        
        return ResponseEntity.ok().body(new TokenBalanceResponse(newBalance));
    }
    
    @GetMapping("/add-from-ad")
    public ResponseEntity<?> addTokensFromAd(HttpServletRequest httpRequest) {
        UUID userId = (UUID) httpRequest.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        
        tokenService.addTokens(userId, 1);
        
        int newBalance = tokenService.getTokenBalance(userId);
        
        return ResponseEntity.ok().body(new TokenBalanceResponse(newBalance));
    }
}