package com.example.iusj_report_service.dto;

import com.example.iusj_report_service.entities.Rapport;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RapportData {

    private String titre;
    private Rapport.ReportType type;
    private LocalDateTime generatedAt;
    private LocalDate periodeDebut;
    private LocalDate periodeFin;
    private Long generatedBy;
    private Map<String, Object> metadata;
    private List<Map<String, Object>> rows;
}
