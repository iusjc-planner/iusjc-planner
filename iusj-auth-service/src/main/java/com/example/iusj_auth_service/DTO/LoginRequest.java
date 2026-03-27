package com.example.iusj_auth_service.DTO;

import lombok.Data;

@Data
public class LoginRequest {
    private String login;
    private String password;
}
