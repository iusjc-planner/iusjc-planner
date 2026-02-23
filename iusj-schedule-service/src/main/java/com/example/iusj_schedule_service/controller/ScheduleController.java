package com.example.iusj_schedule_service.controller;

import java.time.LocalDateTime;
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
        List<String> conflicts = service.validateConflicts(entry, null);
        Map<String, Object> response = new HashMap<>();
        response.put("conflict", !conflicts.isEmpty());
        response.put("reasons", conflicts);
        return ResponseEntity.ok(response);
    }
}
