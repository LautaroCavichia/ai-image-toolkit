package com.chunaudis.image_toolkit.security;

import java.io.IOException;
import java.util.ArrayList;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtRequestFilter.class);
    private final JwtUtil jwtUtil;

    public JwtRequestFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
        throws ServletException, IOException {

    String path = request.getRequestURI();
      System.out.println("[JwtRequestFilter] URI entrante: \"" + path + "\"");

    // Si la ruta es /api/v1/auth/forgot-password o /reset-password, pasa sin validar JWT
  if ("/auth/forgot-password".equals(path) || "/auth/reset-password".equals(path)) {
    chain.doFilter(request, response);
    return;
}

    final String requestTokenHeader = request.getHeader("Authorization");

    String userId = null;
    String jwtToken = null;

    // JWT Token is in the form "Bearer token". Remove "Bearer " and get token
    if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer ")) {
        jwtToken = requestTokenHeader.substring(7);
        try {
            userId = jwtUtil.getUserIdFromToken(jwtToken).toString();
        } catch (IllegalArgumentException e) {
            log.debug("Unable to get JWT Token");
        } catch (ExpiredJwtException e) {
            log.debug("JWT Token has expired");
        } catch (Exception e) {
            log.debug("Error processing JWT token: {}", e.getMessage());
        }
    } else {
        log.trace("JWT Token does not begin with Bearer String or is missing");
    }
    
    if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
        try {
            UUID userUUID = UUID.fromString(userId);
            
            if (jwtUtil.validateToken(jwtToken, userUUID)) {
                UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(userUUID, null, new ArrayList<>());
                
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                SecurityContextHolder.getContext().setAuthentication(authentication);
                
                request.setAttribute("userId", userUUID);
                
                log.info("Authentication set for user ID: {}", userUUID);
            } else {
                log.warn("JWT token validation failed for user ID: {}", userUUID);
            }
        } catch (Exception e) {
            log.warn("Cannot set user authentication for user {}: {}", userId, e.getMessage());
        }
    }
    
    chain.doFilter(request, response);
}

}