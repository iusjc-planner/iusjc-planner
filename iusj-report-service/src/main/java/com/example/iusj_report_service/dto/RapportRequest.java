package com.example.iusj_report_service.dto;

import com.example.iusj_report_service.entities.Rapport;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RapportRequest {

    @NotNull
    private Rapport.ReportType type;

    @NotNull
    private Rapport.ReportFormat format;

    private LocalDate periodeDebut;

    private LocalDate periodeFin;

    private Long salleId;

    private Long teacherId;

    private Long schoolId;

    private Map<String, Object> params;
}
