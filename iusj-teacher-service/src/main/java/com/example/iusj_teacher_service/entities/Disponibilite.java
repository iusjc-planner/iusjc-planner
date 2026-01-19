package com.example.iusj_teacher_service.entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Représente un créneau de disponibilité d'un enseignant
 */
@Entity
@Table(name = "disponibilites", indexes = {
        @Index(name = "idx_teacher_id", columnList = "teacher_id"),
        @Index(name = "idx_date", columnList = "date")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Disponibilite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_disponibilite")
    private Long id;

    /**
     * ID de l'utilisateur (enseignant)
     */
    @Column(name = "user_id", nullable = false)
    private Long userId;

    /**
     * Date de la disponibilité
     */
    @Column(name = "date", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    /**
     * Heure de début du créneau
     */
    @Column(name = "heure_debut", nullable = false)
    @JsonFormat(pattern = "HH:mm", shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING)
    private LocalTime heureDebut;

    /**
     * Durée en minutes
     */
    @Column(name = "duree", nullable = false)
    private Integer duree;

    /**
     * Indique si le créneau est disponible (true) ou indisponible (false)
     */
    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable = true;

    /**
     * Raison de l'indisponibilité (optionnel)
     */
    @Column(name = "reason", length = 255)
    private String reason;

    /**
     * Indique si cette disponibilité vient d'un import ICS
     */
    @Column(name = "from_ics_import")
    private Boolean fromIcsImport = false;

    /**
     * UID de l'événement ICS (pour synchronisation)
     */
    @Column(name = "ics_event_uid", length = 255)
    private String icsEventUid;
}
