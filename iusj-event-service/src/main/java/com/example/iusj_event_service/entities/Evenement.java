package com.example.iusj_event_service.entities;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "evenements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Evenement {

    public enum EventType {
        EXAMEN,
        CONFERENCE,
        REUNION,
        SOUTENANCE,
        CEREMONIE,
        AUTRE
    }

    public enum EventStatus {
        PLANIFIE,
        CONFIRME,
        ANNULE,
        TERMINE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 255)
    private String nom;

    @Size(max = 1000)
    @Column(length = 1000)
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(length = 32, nullable = false)
    private EventType type;

    @NotNull
    @FutureOrPresent
    @Column(nullable = false)
    private LocalDate date;

    @NotNull
    @Column(nullable = false)
    private LocalTime heureDebut;

    @NotNull
    @Min(15)
    @Max(1440)
    @Column(nullable = false)
    private Integer duree;

    private Long salleId;

    @NotNull
    @Column(nullable = false)
    private Long organisateurId;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(length = 32, nullable = false)
    private EventStatus status;

    @ElementCollection
    @CollectionTable(name = "evenement_participants", joinColumns = @JoinColumn(name = "evenement_id"))
    @Column(name = "participant_id")
    private List<Long> participantIds = new ArrayList<>();

    @Size(max = 1000)
    @Column(length = 1000)
    private String notes;

    private Long roomReservationId;

    @PrePersist
    public void prePersist() {
        if (status == null) {
            status = EventStatus.PLANIFIE;
        }
    }
}
