package com.chunaudis.image_toolkit.security;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;

@Component
public class JwtUtil {

    // JWT token validity (in milliseconds) - 10 days
    private static final long JWT_TOKEN_VALIDITY = 10 * 24 * 60 * 60 * 1000;

    private final Key signingKey;

    public JwtUtil(Key jwtSigningKey) {
        this.signingKey = jwtSigningKey;
    }

    public UUID getUserIdFromToken(String token) {
        String userId = getClaimFromToken(token, Claims::getSubject);
        return UUID.fromString(userId);
    }
    
    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }

    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }
    
    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Boolean isTokenExpired(String token) {
        final Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }

    public String generateToken(UUID userId, String email) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", email);
        return doGenerateToken(claims, userId.toString());
    }

    private String doGenerateToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + JWT_TOKEN_VALIDITY))
                .signWith(signingKey) // Use the injected signing key
                .compact();
    }

    public Boolean validateToken(String token, UUID userId) {
        final UUID extractedUserId = getUserIdFromToken(token);
        return (extractedUserId.equals(userId) && !isTokenExpired(token));
    }
}