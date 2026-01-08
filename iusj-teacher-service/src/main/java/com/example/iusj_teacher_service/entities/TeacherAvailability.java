package com.example.iusj_teacher_service.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Représente une plage de disponibilité ou d'indisponibilité d'un enseignant.
 * Les disponibilités peuvent être récurrentes (hebdomadaires) ou ponctuelles (dates spécifiques).
 */
@Entity
@Table(name = "teacher_availability", indexes = {
    @Index(name = "idx_availability_teacher_id", columnList = "teacher_id"),
    @Index(name = "idx_availability_day_of_week", columnList = "day_of_week"),
    @Index(name = "idx_availability_specific_date", columnList = "specific_date")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeacherAvailability {

    public enum AvailabilityType {
        /**
         * Disponibilité récurrente chaque semaine (ex: tous les lundis de 8h à 12h)
         */
        WEEKLY_RECURRING,
        
        /**
         * Indisponibilité ponctuelle (ex: absent le 15 janvier 2025)
         */
        SPECIFIC_DATE,
        
        /**
         * Période d'indisponibilité (ex: vacances du 20 au 31 décembre)
         */
        DATE_RANGE
    }

    public enum AvailabilityStatus {
        /**
         * Créneau disponible pour les cours
         */
        AVAILABLE,
        
        /**
         * Créneau indisponible (événement personnel, autre engagement)
         */
        UNAVAILABLE,
        
        /**
         * Créneau préféré (idéal pour planifier des cours)
         */
        PREFERRED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * ID de l'enseignant concerné
     */
    @NotNull
    @Column(name = "teacher_id", nullable = false)
    private Long teacherId;

    /**
     * Type de disponibilité
     */
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "availability_type", nullable = false)
    private AvailabilityType availabilityType;

    /**
     * Statut de disponibilité
     */
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AvailabilityStatus status;

    /**
     * Jour de la semaine pour les disponibilités récurrentes (1=Lundi, 7=Dimanche)
     */
    @Min(1)
    @Max(7)
    @Column(name = "day_of_week")
    private Integer dayOfWeek;

    /**
     * Heure de début du créneau
     */
    @NotNull
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    /**
     * Heure de fin du créneau
     */
    @NotNull
    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    /**
     * Date spécifique (pour SPECIFIC_DATE ou début de DATE_RANGE)
     */
    @Column(name = "specific_date")
    private LocalDate specificDate;

    /**
     * Date de fin (uniquement pour DATE_RANGE)
     */
    @Column(name = "end_date")
    private LocalDate endDate;

    /**
     * Raison ou description (optionnel)
     */
    @Column(name = "reason", length = 255)
    private String reason;

    /**
     * UID de l'événement ICS source (pour éviter les doublons lors de l'import)
     */
    @Column(name = "ics_event_uid", length = 255)
    private String icsEventUid;

    /**
     * Indique si cette entrée provient d'un import ICS
     */
    @Column(name = "from_ics_import")
    private Boolean fromIcsImport = false;
}
