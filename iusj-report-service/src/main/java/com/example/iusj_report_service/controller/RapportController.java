package com.example.iusj_report_service.controller;

import com.example.iusj_report_service.dto.RapportRequest;
import com.example.iusj_report_service.entities.Rapport;
import com.example.iusj_report_service.services.RapportService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class RapportController {

    private final RapportService rapportService;

    @GetMapping
    public List<Rapport> list(
            @RequestParam(required = false) Rapport.ReportType type,
            @RequestParam(required = false) Long generatedBy,
            @RequestHeader("X-User-Role") String role) {
        assertAdmin(role);
        return rapportService.listReports(type, generatedBy);
    }

    @GetMapping("/{id}")
    public Rapport getById(@PathVariable Long id, @RequestHeader("X-User-Role") String role) {
        assertAdmin(role);
        return rapportService.getById(id);
    }

    @PostMapping("/generate")
    public ResponseEntity<Rapport> generate(
            @Valid @RequestBody RapportRequest request,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Id") Long userId) {
        assertAdmin(role);
        return ResponseEntity.status(201).body(rapportService.generate(request, userId));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> download(@PathVariable Long id, @RequestHeader("X-User-Role") String role) {
        assertAdmin(role);
        Rapport report = rapportService.getById(id);
        byte[] content = rapportService.loadReportFile(id);

        MediaType mediaType = switch (report.getFormat()) {
            case PDF -> MediaType.APPLICATION_PDF;
            case EXCEL -> MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            case JSON -> MediaType.APPLICATION_JSON;
        };

        String extension = switch (report.getFormat()) {
            case PDF -> ".pdf";
            case EXCEL -> ".xlsx";
            case JSON -> ".json";
        };

        return ResponseEntity.ok()
            .contentType(mediaType)
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=rapport_" + id + extension)
            .body(content);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @RequestHeader("X-User-Role") String role) {
        assertAdmin(role);
        rapportService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/occupation-salle")
    public Rapport occupationSalle(
            @RequestParam LocalDate from,
            @RequestParam LocalDate to,
            @RequestParam(required = false) Long salleId,
            @RequestParam(defaultValue = "PDF") Rapport.ReportFormat format,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Id") Long userId) {
        assertAdmin(role);
        return rapportService.generateOccupationSalleReport(from, to, salleId, userId, format);
    }

    @GetMapping("/charge-enseignant")
    public Rapport chargeEnseignant(
            @RequestParam LocalDate from,
            @RequestParam LocalDate to,
            @RequestParam(required = false) Long teacherId,
            @RequestParam(defaultValue = "PDF") Rapport.ReportFormat format,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Id") Long userId) {
        assertAdmin(role);
        return rapportService.generateChargeEnseignantReport(from, to, teacherId, userId, format);
    }

    @GetMapping("/statistiques-ecole/{schoolId}")
    public Rapport statistiquesEcole(
            @PathVariable Long schoolId,
            @RequestParam(defaultValue = "PDF") Rapport.ReportFormat format,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Id") Long userId) {
        assertAdmin(role);
        return rapportService.generateStatistiquesEcoleReport(schoolId, userId, format);
    }

    @GetMapping("/evenements")
    public Rapport evenements(
            @RequestParam LocalDate from,
            @RequestParam LocalDate to,
            @RequestParam(defaultValue = "PDF") Rapport.ReportFormat format,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Id") Long userId) {
        assertAdmin(role);
        return rapportService.generateEvenementsReport(from, to, userId, format);
    }

    @GetMapping("/global")
    public Rapport global(
            @RequestParam LocalDate from,
            @RequestParam LocalDate to,
            @RequestParam(defaultValue = "PDF") Rapport.ReportFormat format,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Id") Long userId) {
        assertAdmin(role);
        return rapportService.generateGlobalReport(from, to, userId, format);
    }

    @PostMapping("/maintenance/purge")
    public Map<String, Object> purge(@RequestHeader("X-User-Role") String role) {
        assertAdmin(role);
        int deleted = rapportService.purgeExpiredReports();
        return Map.of("deleted", deleted);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<String> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(404).body(ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<String> handleResponseStatus(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(ex.getReason());
    }

    private void assertAdmin(String role) {
        if (role == null || !"ADMIN".equalsIgnoreCase(role)) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Role ADMIN requis");
        }
    }
}
