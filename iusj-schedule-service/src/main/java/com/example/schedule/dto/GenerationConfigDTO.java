package com.example.schedule.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Configuration pour la génération automatique de l'emploi du temps
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GenerationConfigDTO {
    
    private LocalDate startDate;
    private LocalDate endDate;
    
    // Filtres optionnels
    private Long schoolId;
    private Long filiereId;
    private List<Long> groupIds;
    
    // Configuration horaire
    private boolean excludeWeekends = true;
    private LocalTime dailyStartTime = LocalTime.of(8, 0);
    private LocalTime dailyEndTime = LocalTime.of(18, 0);
    private int sessionDuration = 120; // minutes
    private int breakDuration = 15; // minutes
}
