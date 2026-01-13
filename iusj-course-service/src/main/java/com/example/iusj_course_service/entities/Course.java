package com.example.iusj_course_service.entities;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Course (Séance) - représente une séance de cours à insérer dans l'emploi du temps
 * Référence une Matière existante
 */
@Entity
@Table(name = "courses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Course {

    public enum CourseStatus {
        SCHEDULED,   // Programmée
        COMPLETED,   // Terminée
        CANCELLED,   // Annulée
        POSTPONED    // Reportée
    }

    public enum CourseType {
        CM,  // Cours Magistral
        TD,  // Travaux Dirigés
        TP,  // Travaux Pratiques
        EXAM // Examen
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Référence à la matière
     */
    @NotNull
    private Long matiereId;

    /**
     * Type de séance
     */
    @Enumerated(EnumType.STRING)
    private CourseType type = CourseType.CM;

    /**
     * Titre spécifique de la séance (optionnel)
     * Si non renseigné, on utilisera le nom de la matière
     */
    @Size(max = 200)
    private String title;

    @Size(max = 500)
    private String description;

    /**
     * Date de la séance
     */
    @NotNull
    private LocalDate date;

    /**
     * Heure de début
     */
    @NotNull
    private LocalTime startTime;

    /**
     * Heure de fin
     */
    @NotNull
    private LocalTime endTime;

    /**
     * Salle assignée
     */
    private Long roomId;

    /**
     * Groupe assigné (si applicable)
     */
    private Long groupId;

    /**
     * Enseignant pour cette séance (peut être différent du responsable de matière)
     * Si null, on prend l'enseignant de la matière
     */
    private Long teacherId;

    @Enumerated(EnumType.STRING)
    private CourseStatus status = CourseStatus.SCHEDULED;

    /**
     * Numéro de la séance dans la séquence du cours (e.g., Séance 1, 2, 3...)
     */
    private Integer sequenceNumber;

    /**
     * Notes/commentaires sur cette séance
     */
    @Size(max = 1000)
    private String notes;
}

