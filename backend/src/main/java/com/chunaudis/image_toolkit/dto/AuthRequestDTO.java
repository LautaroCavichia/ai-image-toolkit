package com.chunaudis.image_toolkit.dto;

import lombok.Data;

@Data
public class AuthRequestDTO {
    private String email;
    private String password;
    private String displayName;
}
