package com.example.iusj_teacher_service.controller;

import com.example.iusj_teacher_service.entities.Disponibilite;
import com.example.iusj_teacher_service.entities.Teacher;
import com.example.iusj_teacher_service.services.DisponibiliteService;
import com.example.iusj_teacher_service.services.TeacherService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Contrôleur REST pour gérer les disponibilités des enseignants
 * NOTE: Le {userId} dans le path correspond à l'ID utilisateur (Teacher est un User avec rôle USER)
 */
@RestController
@RequestMapping("/api/teachers/{userId}/disponibilites")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"}, allowCredentials = "true")
public class DisponibiliteController {

    private final DisponibiliteService disponibiliteService;

    public DisponibiliteController(DisponibiliteService disponibiliteService) {
        this.disponibiliteService = disponibiliteService;
    }

    /**
     * Récupère toutes les disponibilités d'un enseignant par son userId
     */
    @GetMapping
    public ResponseEntity<List<Disponibilite>> getAll(@PathVariable Long userId) {
        List<Disponibilite> disponibilites = disponibiliteService.getByTeacherId(userId);
        return ResponseEntity.ok(disponibilites);
    }

    /**
     * Récupère les disponibilités disponibles d'un enseignant
     */
    @GetMapping("/available")
    public ResponseEntity<List<Disponibilite>> getAvailable(@PathVariable Long userId) {
        List<Disponibilite> disponibilites = disponibiliteService.getAvailableByTeacherId(userId);
        return ResponseEntity.ok(disponibilites);
    }

    /**
     * Récupère les disponibilités d'un enseignant pour une date spécifique
     */
    @GetMapping("/date/{date}")
    public ResponseEntity<List<Disponibilite>> getByDate(
            @PathVariable Long userId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Disponibilite> disponibilites = disponibiliteService.getByTeacherIdAndDate(userId, date);
        return ResponseEntity.ok(disponibilites);
    }

    /**
     * Récupère les disponibilités disponibles d'un enseignant pour une date
     */
    @GetMapping("/available/date/{date}")
    public ResponseEntity<List<Disponibilite>> getAvailableByDate(
            @PathVariable Long userId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Disponibilite> disponibilites = disponibiliteService.getAvailableByTeacherIdAndDate(userId, date);
        return ResponseEntity.ok(disponibilites);
    }

    /**
     * Récupère les disponibilités d'un enseignant entre deux dates
     */
    @GetMapping("/range")
    public ResponseEntity<List<Disponibilite>> getByDateRange(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<Disponibilite> disponibilites = disponibiliteService.getByTeacherIdAndDateRange(userId, startDate, endDate);
        return ResponseEntity.ok(disponibilites);
    }

    /**
     * Endpoint de test pour vérifier que le contrôleur fonctionne
     */
    @PostMapping("/test")
    public ResponseEntity<String> test(@RequestBody Disponibilite disponibilite) {
        return ResponseEntity.ok("Test OK: " + disponibilite);
    }

    /**
     * Crée une nouvelle disponibilité
     */
    @PostMapping
    public ResponseEntity<Disponibilite> create(
            @PathVariable Long userId,
            @RequestBody Disponibilite disponibilite) {
        disponibilite.setUserId(userId);
        Disponibilite created = disponibiliteService.create(userId, disponibilite);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Crée plusieurs disponibilités à la fois
     */
    @PostMapping("/batch")
    public ResponseEntity<List<Disponibilite>> createBatch(
            @PathVariable Long userId,
            @Valid @RequestBody List<Disponibilite> disponibilites) {
        try {
            List<Disponibilite> created = disponibiliteService.createMultiple(userId, disponibilites);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Met à jour une disponibilité
     */
    @PutMapping("/{id}")
    public ResponseEntity<Disponibilite> update(
            @PathVariable Long userId,
            @PathVariable Long id,
            @Valid @RequestBody Disponibilite disponibilite) {
        return disponibiliteService.update(id, disponibilite)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Supprime une disponibilité
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long userId,
            @PathVariable Long id) {
        disponibiliteService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Remplace toutes les disponibilités d'un enseignant
     * Utile pour mettre à jour l'emploi du temps complet
     */
    @PutMapping
    public ResponseEntity<List<Disponibilite>> replaceAll(
            @PathVariable Long userId,
            @Valid @RequestBody List<Disponibilite> disponibilites) {
        try {
            List<Disponibilite> updated = disponibiliteService.replaceAll(userId, disponibilites);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
