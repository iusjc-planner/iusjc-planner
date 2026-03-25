package com.example.iusj_resource_service.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "resource_reservations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResourceReservation {

    public enum ReservationStatus {
        PENDING,
        CONFIRMED,
        CANCELLED,
        RETURNED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "resource_id", referencedColumnName = "id", nullable = false)
    private Resource resource;

    @NotNull
    @Column(name = "reservation_date")
    private LocalDate date;

    @NotNull
    @Column(name = "start_time")
    private LocalTime heureDebut;

    @NotNull
    @Min(15)
    @Column(name = "duration_minutes")
    private Integer duree;

    @NotNull
    @Column(name = "reserved_by")
    private Long reservePar;

    @NotNull
    @Min(1)
    private Integer quantite;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ReservationStatus status = ReservationStatus.PENDING;

    @Size(max = 500)
    private String motif;

    @Column(name = "expected_return_date")
    private LocalDateTime dateRetourPrevue;

    @Column(name = "actual_return_date")
    private LocalDateTime dateRetourEffective;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
        if (status == null) {
            status = ReservationStatus.PENDING;
        }
    }
}
