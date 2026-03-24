package com.example.iusj_schedule_service.controller;

import com.example.iusj_schedule_service.entities.EDT;
import com.example.iusj_schedule_service.entities.ScheduleEntry;
import com.example.iusj_schedule_service.services.EDTService;
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

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/edt")
public class EDTController {

    private final EDTService edtService;

    public EDTController(EDTService edtService) {
        this.edtService = edtService;
    }

    @GetMapping
    public List<EDT> list(
            @RequestParam(required = false) Integer semaine,
            @RequestParam(required = false) Integer annee,
            @RequestParam(required = false) EDT.VueType vue,
            @RequestParam(required = false) Long targetId,
            @RequestParam(required = false) EDT.EDTStatus status,
            @RequestParam(required = false) EDT.PeriodeType periode) {
        return edtService.list(semaine, annee, vue, targetId, status, periode);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EDT> get(@PathVariable Long id) {
        return edtService.getById(id)
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

    @PutMapping("/{id}/validate")
    public ResponseEntity<EDT> validate(@PathVariable Long id) {
        return ResponseEntity.ok(edtService.validate(id));
    }

    @PutMapping("/{id}/publish")
    public ResponseEntity<EDT> publish(@PathVariable Long id) {
        return ResponseEntity.ok(edtService.publish(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        edtService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/weekly-view")
    public ResponseEntity<Map<String, List<ScheduleEntry>>> weeklyView(@PathVariable Long id) {
        return ResponseEntity.ok(edtService.weeklyView(id));
    }

    @GetMapping("/{id}/export")
    public ResponseEntity<byte[]> exportById(
            @PathVariable Long id,
            @RequestParam(defaultValue = "pdf") String format) {
        if (!"pdf".equalsIgnoreCase(format)) {
            return ResponseEntity.badRequest().build();
        }
        byte[] content = edtService.exportPdfByEdtId(id);
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_PDF)
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=EDT_" + id + ".pdf")
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
        if (!"pdf".equalsIgnoreCase(format)) {
            return ResponseEntity.badRequest().build();
        }
        byte[] content = edtService.exportPdfForView(vue, targetId, semaine, annee, creePar);
        String filename = String.format("EDT_%s_%d_S%d_%d.pdf", vue.name(), targetId, semaine, annee);
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_PDF)
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
            .body(content);
    }
}
