package com.example.iusj_schedule_service.controller;

import com.example.iusj_schedule_service.dto.GenerationRequest;
import com.example.iusj_schedule_service.dto.GenerationResult;
import com.example.iusj_schedule_service.dto.SlotSuggestion;
import com.example.iusj_schedule_service.dto.ValidationRequest;
import com.example.iusj_schedule_service.dto.ValidationReport;
import com.example.iusj_schedule_service.dto.ValidationResult;
import com.example.iusj_schedule_service.entities.EDT;
import com.example.iusj_schedule_service.entities.ScheduleEntry;
import com.example.iusj_schedule_service.services.EDTService;
import com.example.iusj_schedule_service.services.ScheduleGeneratorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/edt")
public class EDTController {

    private final EDTService edtService;
    private final ScheduleGeneratorService scheduleGeneratorService;

    public EDTController(EDTService edtService, ScheduleGeneratorService scheduleGeneratorService) {
        this.edtService = edtService;
        this.scheduleGeneratorService = scheduleGeneratorService;
    }

    @GetMapping
    public List<EDT> list(
            @RequestParam(required = false) Integer semaine,
            @RequestParam(required = false) Integer annee,
            @RequestParam(required = false) EDT.VueType vue,
            @RequestParam(required = false) Long targetId,
            @RequestParam(required = false) EDT.EDTStatus status,
            @RequestParam(required = false) EDT.PeriodeType periode,
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        return edtService.list(semaine, annee, vue, targetId, status, periode, userRole, userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EDT> get(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        return edtService.getByIdVisible(id, userRole, userId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<EDT> create(@Valid @RequestBody EDT edt) {
        return ResponseEntity.status(HttpStatus.CREATED).body(edtService.create(edt));
    }

    @GetMapping("/groupe/{groupeId}")
    public ResponseEntity<EDT> getByGroupe(
            @PathVariable Long groupeId,
            @RequestParam Integer semaine,
            @RequestParam Integer annee) {
        return edtService.getByGroupe(groupeId, semaine, annee)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/groups/{groupId}/edt")
    public ResponseEntity<EDT> getByGroupCompatibility(
            @PathVariable Long groupId,
            @RequestParam Integer semaine,
            @RequestParam Integer annee) {
        return edtService.getByGroupe(groupId, semaine, annee)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/enseignant/{teacherId}")
    public ResponseEntity<EDT> getByEnseignant(
            @PathVariable Long teacherId,
            @RequestParam Integer semaine,
            @RequestParam Integer annee) {
        return edtService.getByEnseignant(teacherId, semaine, annee)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/salle/{salleId}")
    public ResponseEntity<EDT> getBySalle(
            @PathVariable Long salleId,
            @RequestParam Integer semaine,
            @RequestParam Integer annee) {
        return edtService.getBySalle(salleId, semaine, annee)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/entries")
    public List<ScheduleEntry> getEntries(@PathVariable Long id) {
        return edtService.getEntries(id);
    }

    @PostMapping("/{id}/entries")
    public ResponseEntity<ScheduleEntry> addEntry(@PathVariable Long id, @Valid @RequestBody ScheduleEntry entry) {
        return ResponseEntity.status(HttpStatus.CREATED).body(edtService.addEntry(id, entry));
    }

    @PutMapping("/entries/{entryId}")
    public ResponseEntity<?> updateEntry(@PathVariable Long entryId, @Valid @RequestBody ScheduleEntry entry) {
        try {
            return edtService.updateEntry(entryId, entry)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
        }
    }

    @DeleteMapping("/entries/{entryId}")
    public ResponseEntity<Void> deleteEntry(@PathVariable Long entryId) {
        edtService.deleteEntry(entryId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/validate")
    public ResponseEntity<ValidationReport> validate(@PathVariable Long id) {
        return ResponseEntity.ok(edtService.validate(id));
    }

    @PutMapping("/{id}/publish")
    public ResponseEntity<EDT> publish(@PathVariable Long id) {
        return ResponseEntity.ok(edtService.publish(id));
    }

    @PutMapping("/{id}/unpublish")
    public ResponseEntity<EDT> unpublish(@PathVariable Long id) {
        return ResponseEntity.ok(edtService.unpublish(id));
    }

    @GetMapping("/{id}/validation-report")
    public ResponseEntity<ValidationReport> getValidationReport(@PathVariable Long id) {
        return ResponseEntity.ok(edtService.getValidationReport(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        edtService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/generate")
    public ResponseEntity<GenerationResult> generate(
            @Valid @RequestBody GenerationRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (request.getCreePar() == null) {
            request.setCreePar(userId);
        }
        return ResponseEntity.ok(scheduleGeneratorService.generate(request));
    }

    @GetMapping("/suggestions")
    public ResponseEntity<List<SlotSuggestion>> suggestions(
            @RequestParam Long teacherId,
            @RequestParam LocalDate date,
            @RequestParam(required = false) Long groupId,
            @RequestParam(required = false) Long matiereId,
            @RequestParam(required = false) Integer effectif,
            @RequestParam(required = false) List<String> equipments) {
        List<SlotSuggestion> suggestions = scheduleGeneratorService.getAvailableSlots(teacherId, date);
        List<Long> roomIds = scheduleGeneratorService.getSuggestedRooms(effectif, equipments);
        if (!roomIds.isEmpty()) {
            Long preferred = roomIds.get(0);
            for (SlotSuggestion suggestion : suggestions) {
                suggestion.setRoomId(preferred);
            }
        }
        return ResponseEntity.ok(suggestions);
    }

    @PostMapping("/validate-entry")
    public ResponseEntity<ValidationResult> validateEntry(@Valid @RequestBody ValidationRequest request) {
        return ResponseEntity.ok(scheduleGeneratorService.validateEntry(request));
    }

    @GetMapping("/{id}/weekly-view")
    public ResponseEntity<Map<String, List<ScheduleEntry>>> weeklyView(@PathVariable Long id) {
        return ResponseEntity.ok(edtService.weeklyView(id));
    }

    @GetMapping("/{id}/export")
    public ResponseEntity<byte[]> exportById(
            @PathVariable Long id,
            @RequestParam(defaultValue = "pdf") String format) {
        ExportConfig exportConfig = resolveExportConfig(format);
        if (exportConfig == null) {
            return ResponseEntity.badRequest().build();
        }
        byte[] content = switch (exportConfig.format) {
            case PDF -> edtService.exportPdfByEdtId(id);
            case EXCEL -> edtService.exportExcelByEdtId(id);
        };
        return ResponseEntity.ok()
            .contentType(exportConfig.mediaType)
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=EDT_" + id + exportConfig.extension)
            .body(content);
    }

    @GetMapping("/groupe/{groupeId}/export")
    public ResponseEntity<byte[]> exportGroupePdf(
            @PathVariable Long groupeId,
            @RequestParam Integer semaine,
            @RequestParam Integer annee,
            @RequestParam(defaultValue = "pdf") String format,
            @RequestHeader(value = "X-User-Id", required = false) Long creePar) {
        return exportByVue(EDT.VueType.GROUPE, groupeId, semaine, annee, format, creePar);
    }

    @GetMapping("/enseignant/{teacherId}/export")
    public ResponseEntity<byte[]> exportTeacherPdf(
            @PathVariable Long teacherId,
            @RequestParam Integer semaine,
            @RequestParam Integer annee,
            @RequestParam(defaultValue = "pdf") String format,
            @RequestHeader(value = "X-User-Id", required = false) Long creePar) {
        return exportByVue(EDT.VueType.ENSEIGNANT, teacherId, semaine, annee, format, creePar);
    }

    @GetMapping("/salle/{salleId}/export")
    public ResponseEntity<byte[]> exportRoomPdf(
            @PathVariable Long salleId,
            @RequestParam Integer semaine,
            @RequestParam Integer annee,
            @RequestParam(defaultValue = "pdf") String format,
            @RequestHeader(value = "X-User-Id", required = false) Long creePar) {
        return exportByVue(EDT.VueType.SALLE, salleId, semaine, annee, format, creePar);
    }

    private ResponseEntity<byte[]> exportByVue(
            EDT.VueType vue,
            Long targetId,
            Integer semaine,
            Integer annee,
            String format,
            Long creePar) {
        ExportConfig exportConfig = resolveExportConfig(format);
        if (exportConfig == null) {
            return ResponseEntity.badRequest().build();
        }
        byte[] content = switch (exportConfig.format) {
            case PDF -> edtService.exportPdfForView(vue, targetId, semaine, annee, creePar);
            case EXCEL -> edtService.exportExcelForView(vue, targetId, semaine, annee, creePar);
        };
        String filename = String.format("EDT_%s_%d_S%d_%d%s", vue.name(), targetId, semaine, annee, exportConfig.extension);
        return ResponseEntity.ok()
            .contentType(exportConfig.mediaType)
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
            .body(content);
    }

    private ExportConfig resolveExportConfig(String format) {
        if ("pdf".equalsIgnoreCase(format)) {
            return new ExportConfig(ExportFormat.PDF, MediaType.APPLICATION_PDF, ".pdf");
        }
        if ("excel".equalsIgnoreCase(format) || "xlsx".equalsIgnoreCase(format)) {
            return new ExportConfig(
                ExportFormat.EXCEL,
                MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
                ".xlsx"
            );
        }
        return null;
    }

    private enum ExportFormat {
        PDF,
        EXCEL
    }

    private record ExportConfig(ExportFormat format, MediaType mediaType, String extension) {
    }
}
