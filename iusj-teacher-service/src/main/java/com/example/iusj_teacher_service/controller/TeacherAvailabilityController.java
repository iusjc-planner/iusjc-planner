package com.example.iusj_teacher_service.controller;

import com.example.iusj_teacher_service.entities.TeacherAvailability;
import com.example.iusj_teacher_service.services.IcsParserService;
import com.example.iusj_teacher_service.services.IcsParserService.IcsParseException;
import com.example.iusj_teacher_service.services.TeacherAvailabilityService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Contrôleur REST pour gérer les disponibilités des enseignants.
 * 
 * Endpoints:
 * - GET /api/teachers/{id}/availability - Liste toutes les disponibilités
 * - GET /api/teachers/{id}/availability/grid - Grille hebdomadaire formatée
 * - POST /api/teachers/{id}/availability - Crée une disponibilité manuellement
 * - POST /api/teachers/{id}/availability/import-ics - Import depuis fichier ICS
 * - PUT /api/teachers/{id}/availability/{availabilityId} - Met à jour une disponibilité
 * - DELETE /api/teachers/{id}/availability/{availabilityId} - Supprime une disponibilité
 * - DELETE /api/teachers/{id}/availability/ics-imported - Supprime les imports ICS
 * - GET /api/teachers/{id}/availability/check - Vérifie la disponibilité à une date/heure
 */
@RestController
@RequestMapping("/api/teachers/{teacherId}/availability")
public class TeacherAvailabilityController {

    private static final Logger logger = LoggerFactory.getLogger(TeacherAvailabilityController.class);

    private final TeacherAvailabilityService availabilityService;
    private final IcsParserService icsParserService;

    public TeacherAvailabilityController(
            TeacherAvailabilityService availabilityService,
            IcsParserService icsParserService) {
        this.availabilityService = availabilityService;
        this.icsParserService = icsParserService;
    }

    /**
     * Récupère toutes les disponibilités d'un enseignant
     */
    @GetMapping
    public ResponseEntity<List<TeacherAvailability>> getAllAvailabilities(@PathVariable Long teacherId) {
        try {
            List<TeacherAvailability> availabilities = availabilityService.getAvailabilitiesByTeacherId(teacherId);
            return ResponseEntity.ok(availabilities);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Récupère la grille de disponibilités hebdomadaires formatée pour le frontend
     * Format: { 1: { "08:00-09:00": "available", ... }, 2: {...}, ... }
     */
    @GetMapping("/grid")
    public ResponseEntity<Map<Integer, Map<String, String>>> getAvailabilityGrid(@PathVariable Long teacherId) {
        try {
            Map<Integer, Map<String, String>> grid = availabilityService.getWeeklyAvailabilityGrid(teacherId);
            return ResponseEntity.ok(grid);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Récupère les indisponibilités ponctuelles (dates spécifiques et plages de dates)
     */
    @GetMapping("/exceptions")
    public ResponseEntity<List<TeacherAvailability>> getExceptions(@PathVariable Long teacherId) {
        try {
            List<TeacherAvailability> exceptions = availabilityService.getSpecificDateUnavailabilities(teacherId);
            return ResponseEntity.ok(exceptions);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Crée une nouvelle disponibilité manuellement
     */
    @PostMapping
    public ResponseEntity<TeacherAvailability> createAvailability(
            @PathVariable Long teacherId,
            @Valid @RequestBody TeacherAvailability availability) {
        try {
            availability.setTeacherId(teacherId);
            availability.setFromIcsImport(false);
            TeacherAvailability created = availabilityService.createAvailability(availability);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Importe les disponibilités depuis un fichier ICS (Google Calendar export)
     * 
     * Paramètres:
     * - file: Le fichier .ics uploadé
     * - replaceExisting: Si true, supprime les imports ICS précédents avant d'importer
     * 
     * Exemple d'utilisation:
     * POST /api/teachers/1/availability/import-ics
     * Content-Type: multipart/form-data
     * Body: file=@calendrier.ics, replaceExisting=true
     */
    @PostMapping(value = "/import-ics", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> importIcsFile(
            @PathVariable Long teacherId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "replaceExisting", defaultValue = "false") boolean replaceExisting) {
        
        Map<String, Object> response = new HashMap<>();
        
        // Vérifier le fichier
        if (file.isEmpty()) {
            response.put("success", false);
            response.put("message", "Le fichier est vide");
            return ResponseEntity.badRequest().body(response);
        }
        
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".ics")) {
            response.put("success", false);
            response.put("message", "Le fichier doit être au format ICS (.ics)");
            return ResponseEntity.badRequest().body(response);
        }
        
        try {
            // Supprimer les imports précédents si demandé
            if (replaceExisting) {
                availabilityService.deleteIcsImportedAvailabilities(teacherId);
                logger.info("Imports ICS précédents supprimés pour l'enseignant {}", teacherId);
            }
            
            // Parser le fichier ICS
            List<TeacherAvailability> availabilities = icsParserService.parseIcsFile(file, teacherId);
            
            // Filtrer les doublons (basé sur icsEventUid)
            List<TeacherAvailability> toSave = availabilities.stream()
                .filter(av -> av.getIcsEventUid() == null || 
                             !availabilityService.icsEventExists(teacherId, av.getIcsEventUid()))
                .toList();
            
            // Sauvegarder
            List<TeacherAvailability> saved = availabilityService.saveAll(toSave);
            
            response.put("success", true);
            response.put("message", String.format("%d indisponibilités importées avec succès", saved.size()));
            response.put("importedCount", saved.size());
            response.put("totalParsed", availabilities.size());
            response.put("skippedDuplicates", availabilities.size() - saved.size());
            
            logger.info("Import ICS réussi pour l'enseignant {}: {} événements importés", 
                teacherId, saved.size());
            
            return ResponseEntity.ok(response);
            
        } catch (IcsParseException e) {
            logger.error("Erreur de parsing ICS pour l'enseignant {}: {}", teacherId, e.getMessage());
            response.put("success", false);
            response.put("message", "Erreur lors du parsing du fichier ICS: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
            
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
            
        } catch (Exception e) {
            logger.error("Erreur inattendue lors de l'import ICS pour l'enseignant {}", teacherId, e);
            response.put("success", false);
            response.put("message", "Erreur interne lors de l'import");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Met à jour une disponibilité existante
     */
    @PutMapping("/{availabilityId}")
    public ResponseEntity<TeacherAvailability> updateAvailability(
            @PathVariable Long teacherId,
            @PathVariable Long availabilityId,
            @Valid @RequestBody TeacherAvailability availability) {
        
        return availabilityService.getById(availabilityId)
            .filter(existing -> existing.getTeacherId().equals(teacherId))
            .flatMap(existing -> availabilityService.updateAvailability(availabilityId, availability))
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Supprime une disponibilité
     */
    @DeleteMapping("/{availabilityId}")
    public ResponseEntity<Void> deleteAvailability(
            @PathVariable Long teacherId,
            @PathVariable Long availabilityId) {
        
        return availabilityService.getById(availabilityId)
            .filter(existing -> existing.getTeacherId().equals(teacherId))
            .map(existing -> {
                availabilityService.deleteAvailability(availabilityId);
                return ResponseEntity.noContent().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Supprime toutes les disponibilités importées via ICS pour cet enseignant
     */
    @DeleteMapping("/ics-imported")
    public ResponseEntity<Map<String, String>> deleteIcsImported(@PathVariable Long teacherId) {
        try {
            availabilityService.deleteIcsImportedAvailabilities(teacherId);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Toutes les disponibilités importées via ICS ont été supprimées");
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Vérifie si l'enseignant est disponible à une date et heure données
     * 
     * Exemple: GET /api/teachers/1/availability/check?date=2025-01-15&startTime=09:00&endTime=10:00
     */
    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> checkAvailability(
            @PathVariable Long teacherId,
            @RequestParam String date,
            @RequestParam String startTime,
            @RequestParam String endTime) {
        
        try {
            java.time.LocalDate localDate = java.time.LocalDate.parse(date);
            java.time.LocalTime localStartTime = java.time.LocalTime.parse(startTime);
            java.time.LocalTime localEndTime = java.time.LocalTime.parse(endTime);
            
            boolean isAvailable = availabilityService.isTeacherAvailable(
                teacherId, localDate, localStartTime, localEndTime);
            
            Map<String, Object> response = new HashMap<>();
            response.put("teacherId", teacherId);
            response.put("date", date);
            response.put("startTime", startTime);
            response.put("endTime", endTime);
            response.put("available", isAvailable);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
