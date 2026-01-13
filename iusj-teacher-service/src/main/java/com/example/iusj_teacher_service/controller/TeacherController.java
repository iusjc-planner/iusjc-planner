package com.example.iusj_teacher_service.controller;

import com.example.iusj_teacher_service.entities.Teacher;
import com.example.iusj_teacher_service.services.TeacherService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

/**
 * Contrôleur REST pour gérer les enseignants
 */
@RestController
@RequestMapping("/api/teachers")
public class TeacherController {

    private final TeacherService teacherService;

    public TeacherController(TeacherService teacherService) {
        this.teacherService = teacherService;
    }

    /**
     * Récupère tous les enseignants
     */
    @GetMapping
    public List<Teacher> getAllTeachers() {
        return teacherService.getAll();
    }

    /**
     * Récupère un enseignant par son ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Teacher> getTeacherById(@PathVariable Long id) {
        return teacherService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Récupère un enseignant par son userId
     */
    @GetMapping("/by-user/{userId}")
    public ResponseEntity<Teacher> getTeacherByUserId(@PathVariable Long userId) {
        return teacherService.getByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Crée un nouvel enseignant
     * 
     * Body:
     * {
     *   "userId": 1,
     *   "specialities": ["Mathématiques", "Physique"]
     * }
     */
    @PostMapping
    public ResponseEntity<Teacher> createTeacher(
            @RequestParam Long userId,
            @RequestParam(required = false) Set<String> specialities) {
        try {
            Teacher created = teacherService.create(userId, specialities);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Met à jour les spécialités d'un enseignant
     */
    @PutMapping("/{id}")
    public ResponseEntity<Teacher> updateTeacher(
            @PathVariable Long id,
            @RequestParam Set<String> specialities) {
        return teacherService.update(id, specialities)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Supprime un enseignant
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeacher(@PathVariable Long id) {
        teacherService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Ajoute une spécialité à un enseignant
     */
    @PostMapping("/{id}/specialities")
    public ResponseEntity<Teacher> addSpeciality(
            @PathVariable Long id,
            @RequestParam String speciality) {
        return teacherService.addSpeciality(id, speciality)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Supprime une spécialité d'un enseignant
     */
    @DeleteMapping("/{id}/specialities")
    public ResponseEntity<Teacher> removeSpeciality(
            @PathVariable Long id,
            @RequestParam String speciality) {
        return teacherService.removeSpeciality(id, speciality)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
