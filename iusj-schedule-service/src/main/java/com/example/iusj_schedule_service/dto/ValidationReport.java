package com.example.iusj_schedule_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValidationReport {

    public enum ValidationStatus {
        VALID,
        INVALID
    }

    private Long edtId;
    private ValidationStatus status;
    private List<ValidationIssue> errors = new ArrayList<>();
    private List<ValidationIssue> warnings = new ArrayList<>();
    private LocalDateTime validatedAt;

    public boolean isValid() {
        return errors == null || errors.isEmpty();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ValidationIssue {
        private String type;
        private String message;
        private List<Long> entries;
    }
}
