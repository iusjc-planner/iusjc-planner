package com.example.schedule.controllers;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import com.example.schedule.entities.ScheduleEntry;
import com.example.schedule.entities.SessionStatus;
import com.example.schedule.services.ScheduleService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/schedule")
@CrossOrigin
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping
    public List<ScheduleEntry> getAll(
        @RequestParam(required = false) String courseId,
        @RequestParam(required = false) String teacherId,
        @RequestParam(required = false) String roomId,
        @RequestParam(required = false) String groupId,
        @RequestParam(required = false) SessionStatus status,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startFrom,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTo
    ) {
        return scheduleService.findAll(courseId, teacherId, roomId, groupId, status, startFrom, endTo);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScheduleEntry> getById(@PathVariable Long id) {
        ScheduleEntry entry = scheduleService.findById(id);
        if (entry == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(entry);
    }

    @PostMapping
    public ScheduleEntry create(@RequestBody ScheduleEntry entry) {
        return scheduleService.create(entry);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ScheduleEntry> update(@PathVariable Long id, @RequestBody ScheduleEntry entry) {
        ScheduleEntry updated = scheduleService.update(id, entry);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateAuto() {
        return ResponseEntity.ok(scheduleService.generateAuto());
    }

    @GetMapping(value = "/{id}/export/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> exportPdf(@PathVariable Long id) {
        return scheduleService.exportPdfStub(id);
    }

    @GetMapping(value = "/{id}/export/excel", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> exportExcel(@PathVariable Long id) {
        return scheduleService.exportExcelStub(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        scheduleService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public com.example.schedule.services.ScheduleService.ScheduleStats stats() {
        return scheduleService.stats();
    }
}
