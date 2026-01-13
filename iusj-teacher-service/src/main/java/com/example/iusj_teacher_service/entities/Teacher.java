package com.example.iusj_teacher_service.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "teachers", uniqueConstraints = {
        @UniqueConstraint(name = "uk_teacher_email", columnNames = "email")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Teacher {

    public enum Grade {
        ASSISTANT,
        CHEF_TRAVAUX,
        PROFESSEUR
    }

    public enum Status {
        ACTIVE,
        INACTIVE,
        EN_CONGE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 100)
    private String nom;

    @NotBlank
    @Size(max = 100)
    private String prenom;

    @Email
    @NotBlank
    @Size(max = 150)
    private String email;

    @Size(max = 25)
    private String telephone;

    @Size(max = 120)
    private String specialite;

    @Enumerated(EnumType.STRING)
    private Grade grade = Grade.ASSISTANT;

    @Enumerated(EnumType.STRING)
    private Status status = Status.ACTIVE;

    // Lien avec l'utilisateur (user-service)
    private Long userId;
}
