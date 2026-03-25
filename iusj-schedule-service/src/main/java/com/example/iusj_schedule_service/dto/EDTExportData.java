package com.example.iusj_schedule_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EDTExportData {

    private Long edtId;
    private Integer semaine;
    private Integer annee;
    private String vue;
    private Long targetId;
    private Long generatedBy;
    private LocalDateTime generatedAt;
    private List<ExportEntry> entries;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExportEntry {
        private Long courseId;
        private Long teacherId;
        private Long roomId;
        private Long groupId;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String status;
    }
}
