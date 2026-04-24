package com.example.iusj_resource_service.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class ReservationRequest {

    @NotNull
    private LocalDate date;

    @NotNull
    private LocalTime heureDebut;

    @NotNull
    private LocalTime heureFin;

    @NotNull
    @Min(1)
    private Integer quantite;

    private String motif;
}
