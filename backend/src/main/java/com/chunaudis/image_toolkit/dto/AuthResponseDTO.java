package com.chunaudis.image_toolkit.dto;

import lombok.Data;

@Data
public class AuthResponseDTO {
    private String token;
    private String userId;
    private String email;
    private String displayName;
    private String accountType;
    
    public AuthResponseDTO(String token, String userId, String email, String displayName, String accountType) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.displayName = displayName;
        this.accountType = accountType;
    }
}