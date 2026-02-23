package com.example.iusj_auth_service.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="User")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {



    public enum Role {
        ADMIN,
        USER
    }
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String login;
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;


}
