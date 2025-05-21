package com.chunaudis.image_toolkit.dto;

import lombok.Data;

@Data
public class GuestAuthResponseDTO {
    private String token;
    private String userId;
    private String displayName;
    private Boolean isGuest;
    private Integer tokenBalance;
    
    public GuestAuthResponseDTO(String token, String userId, String displayName, Boolean isGuest, Integer tokenBalance) {
        this.token = token;
        this.userId = userId;
        this.displayName = displayName;
        this.isGuest = isGuest;
        this.tokenBalance = tokenBalance;
    }
}