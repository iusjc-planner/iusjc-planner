package com.example.iusj_notification_service.dto;

import lombok.Data;

@Data
public class UserSummary {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
}
