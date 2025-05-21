package com.chunaudis.image_toolkit.service;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chunaudis.image_toolkit.entity.User;
import com.chunaudis.image_toolkit.entity.enums.JobTypeEnum;
import com.chunaudis.image_toolkit.repository.UserRepository;

@Service
public class TokenService {
    
    private static final Logger log = LoggerFactory.getLogger(TokenService.class);
    private final UserRepository userRepository;
    
    public TokenService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    public int getTokenCost(JobTypeEnum jobType) {
        switch (jobType) {
            case BG_REMOVAL:
                return 1;
            case UPSCALE:
                return 1;
            case ENLARGE:
                return 1;
            default:
                return 1;
        }
    }
    
    public boolean hasEnoughTokens(UUID userId, JobTypeEnum jobType) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return false;
        }
        
        int cost = getTokenCost(jobType);
        return user.getTokenBalance() >= cost;
    }
    
    @Transactional
    public boolean deductTokens(UUID userId, JobTypeEnum jobType) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return false;
        }
        
        int cost = getTokenCost(jobType);
        if (user.getTokenBalance() < cost) {
            return false;
        }
        
        user.setTokenBalance(user.getTokenBalance() - cost);
        userRepository.save(user);
        log.info("Deducted {} tokens from user {}, new balance: {}", 
                 cost, userId, user.getTokenBalance());
        return true;
    }
    
    @Transactional
    public void addTokens(UUID userId, int amount) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return;
        }
        
        user.setTokenBalance(user.getTokenBalance() + amount);
        userRepository.save(user);
        log.info("Added {} tokens to user {}, new balance: {}", 
                 amount, userId, user.getTokenBalance());
    }
    
    public int getTokenBalance(UUID userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return 0;
        }
        return user.getTokenBalance();
    }
}