package com.example.iusj_resource_service.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "resource_reservations")
@Data
@NoArgsConstructor
public class ResourceReservation {

    public enum ReservationStatus {
        PENDING, CONFIRMED, CANCELLED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(nullable = false)
    private Long resourceId;

    @NotNull
    @Column(nullable = false)
    private LocalDate date;

    @NotNull
    @Column(nullable = false)
    private LocalTime heureDebut;

    @NotNull
    @Column(nullable = false)
    private LocalTime heureFin;

    @NotNull
    @Min(1)
    @Column(nullable = false)
    private Integer quantite;

    private Long reservePar;

    private String motif;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private ReservationStatus status = ReservationStatus.CONFIRMED;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        if (status == null) status = ReservationStatus.CONFIRMED;
    }
}
