package com.example.iusj_auth_service.controller;

import com.example.iusj_auth_service.DTO.ForgotPasswordRequest;
import com.example.iusj_auth_service.DTO.ForgotPasswordResponse;
import com.example.iusj_auth_service.DTO.LoginRequest;
import com.example.iusj_auth_service.DTO.LoginResponse;
import com.example.iusj_auth_service.DTO.ResetPasswordRequest;
import com.example.iusj_auth_service.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            authService.sendPasswordResetEmail(request.getEmail());
            return ResponseEntity.ok(new ForgotPasswordResponse("Email de reinitialisation envoye", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            authService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok("Mot de passe reinitialise avec succes");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}