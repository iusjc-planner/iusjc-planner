package com.example.iusj_event_service.controller;

import com.example.iusj_event_service.entities.Evenement;
import com.example.iusj_event_service.services.EvenementService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EvenementController {

    private final EvenementService evenementService;

    @GetMapping
    public List<Evenement> list(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Evenement.EventType type,
            @RequestParam(required = false) Long salleId,
            @RequestParam(required = false) Evenement.EventStatus status,
            @RequestParam(required = false) Long organisateurId) {
        return evenementService.getAll(date, from, to, type, salleId, status, organisateurId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Evenement> getById(@PathVariable Long id) {
        return ResponseEntity.ok(evenementService.getById(id));
    }

    @GetMapping("/date/{date}")
    public List<Evenement> getByDate(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return evenementService.getByDate(date);
    }

    @GetMapping("/range")
    public List<Evenement> getByRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return evenementService.getByDateRange(from, to);
    }

    @GetMapping("/salle/{salleId}")
    public List<Evenement> getBySalle(@PathVariable Long salleId) {
        return evenementService.getBySalle(salleId);
    }

    @PostMapping
    public ResponseEntity<Evenement> create(
            @Valid @RequestBody Evenement event,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String role) {
        return ResponseEntity.status(201).body(evenementService.create(event, userId, role));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Evenement> update(
            @PathVariable Long id,
            @Valid @RequestBody Evenement event,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String role) {
        return ResponseEntity.ok(evenementService.update(id, event, userId, role));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Evenement> cancel(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String role) {
        return ResponseEntity.ok(evenementService.cancel(id, userId, role));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String role) {
        evenementService.delete(id, userId, role);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/check-availability")
    public Map<String, Object> checkAvailability(
            @RequestParam Long salleId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime heureDebut,
            @RequestParam Integer duree,
            @RequestParam(required = false) Long excludeEventId) {
        boolean available = evenementService.checkSalleAvailability(salleId, date, heureDebut, duree, excludeEventId);
        return Map.of("available", available);
    }

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        return evenementService.stats();
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
    public ResponseEntity<String> handleStatusException(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(ex.getReason());
    }
}
