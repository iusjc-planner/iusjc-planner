package com.example.schedule.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Résultat de la génération automatique de l'emploi du temps
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerationResultDTO {
    
    private boolean success;
    private String message;
    private int sessionsCreated;
    private int conflicts;
    private int noRoomAvailable;
    private List<GenerationDetailDTO> details;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GenerationDetailDTO {
        private String matiere;
        private String teacher;
        private String group;
        private String room;
        private String date;
        private String time;
        private String status; // created, conflict, no_room
        private String errorMessage;
    }
}
