package com.example.iusj_course_service.controller;

import com.example.iusj_course_service.entities.Support;
import com.example.iusj_course_service.services.SupportService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping
public class SupportController {

    private final SupportService supportService;

    public SupportController(SupportService supportService) {
        this.supportService = supportService;
    }

    @GetMapping("/api/matieres/{matiereId}/supports")
    public List<Support> listByMatiere(@PathVariable Long matiereId) {
        return supportService.getByMatiereId(matiereId);
    }

    @GetMapping("/api/supports/{id}")
    public ResponseEntity<Support> getById(@PathVariable Long id) {
        return ResponseEntity.ok(supportService.getById(id));
    }

    @PostMapping("/api/matieres/{matiereId}/supports")
    public ResponseEntity<Support> create(
            @PathVariable Long matiereId,
            @Valid @RequestBody Support support,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        return ResponseEntity.status(201).body(supportService.create(matiereId, support, userId, role));
    }

    @PutMapping("/api/supports/{id}")
    public ResponseEntity<Support> update(
            @PathVariable Long id,
            @Valid @RequestBody Support support,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        return ResponseEntity.ok(supportService.update(id, support, userId, role));
    }

    @DeleteMapping("/api/supports/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        supportService.delete(id, userId, role);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/supports/types")
    public List<String> types() {
        return Arrays.stream(Support.SupportType.values()).map(Enum::name).toList();
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<String> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(404).body(ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}
