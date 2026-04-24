package com.example.iusj_schedule_service.controller;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.iusj_schedule_service.entities.ScheduleEntry;
import com.example.iusj_schedule_service.services.ScheduleService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/schedule")
public class ScheduleController {

    private final ScheduleService service;

    public ScheduleController(ScheduleService service) {
        this.service = service;
    }

    @GetMapping
    public List<ScheduleEntry> list(@RequestParam(required = false) Long courseId,
                                    @RequestParam(required = false) Long teacherId,
                                    @RequestParam(required = false) Long roomId,
                                    @RequestParam(required = false) Long groupId,
                                    @RequestParam(required = false) ScheduleEntry.Status status,
                                    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startFrom,
                                    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTo) {
        return service.getAll(courseId, teacherId, roomId, groupId, status, startFrom, endTo);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScheduleEntry> get(@PathVariable Long id) {
        return service.getById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody ScheduleEntry entry) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(service.create(entry));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody ScheduleEntry entry) {
        try {
            return service.update(id, entry).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ScheduleService.ScheduleStats stats() {
        return service.stats();
    }

    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validate(@Valid @RequestBody ScheduleEntry entry) {
        ScheduleService.ValidationFeedback feedback = service.validateConflictsWithWarnings(entry, null);
        Map<String, Object> response = new HashMap<>();
        response.put("conflict", !feedback.conflicts().isEmpty());
        response.put("reasons", feedback.conflicts());
        response.put("warnings", feedback.warnings());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/suggest-rooms")
    public ResponseEntity<?> suggestRooms(
            @RequestParam Integer effectif,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime time,
            @RequestParam Integer duration) {
        try {
            LocalDateTime start = LocalDateTime.of(date, time);
            List<ScheduleService.SuggestedRoom> suggestions = service.getSuggestedRooms(effectif, start, duration);
            return ResponseEntity.ok(suggestions);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }

    /**
     * Suggère des salles adaptées au type de cours (CM -> AUDITORIUM, TD -> CLASSROOM, TP -> LAB).
     */
    @GetMapping("/suggest-rooms-by-type")
    public ResponseEntity<?> suggestRoomsByCourseType(
            @RequestParam(required = false) String courseType,
            @RequestParam(required = false) Integer effectif,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime time,
            @RequestParam Integer duration) {
        try {
            LocalDateTime start = LocalDateTime.of(date, time);
            List<ScheduleService.SuggestedRoom> suggestions = service.getSuggestedRoomsByCourseType(courseType, effectif, start, duration);
            return ResponseEntity.ok(suggestions);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }

    @GetMapping("/validate-capacity")
    public ResponseEntity<Map<String, Object>> validateCapacity(
            @RequestParam Long roomId,
            @RequestParam Long groupId) {
        ScheduleService.CapacityValidationResult result = service.validateCapacity(roomId, groupId);
        Map<String, Object> response = new HashMap<>();
        response.put("valid", result.errorMessage() == null);
        response.put("error", result.errorMessage());
        response.put("warning", result.warningMessage());
        return ResponseEntity.ok(response);
    }
}
