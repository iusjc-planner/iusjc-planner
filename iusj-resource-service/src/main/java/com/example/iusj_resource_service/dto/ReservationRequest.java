package com.example.iusj_resource_service.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationRequest {

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotNull(message = "Start time is required")
    private LocalTime heureDebut;

    @NotNull(message = "Duration is required")
    @Min(value = 15, message = "Duration must be at least 15 minutes")
    private Integer duree;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantite;

    @Size(max = 500, message = "Motif must not exceed 500 characters")
    private String motif;

    private LocalDateTime dateRetourPrevue;
}
