package com.example.iusj_teacher_service.controller;

import com.example.iusj_teacher_service.dto.TeacherRequest;
import com.example.iusj_teacher_service.entities.Teacher;
import com.example.iusj_teacher_service.services.TeacherService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur REST pour gérer les enseignants
 */
@RestController
@RequestMapping("/api/teachers")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"}, allowCredentials = "true")
public class TeacherController {

    private final TeacherService teacherService;

    public TeacherController(TeacherService teacherService) {
        this.teacherService = teacherService;
    }

    @GetMapping
    public List<Teacher> listTeachers() {
        return teacherService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Teacher> getTeacher(@PathVariable Long id) {
        return teacherService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Teacher> createTeacher(@Valid @RequestBody TeacherRequest request) {
        Teacher created = teacherService.create(request.getUserId(), request.getSpecialities());
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Teacher> updateTeacher(@PathVariable Long id,
                                                 @Valid @RequestBody TeacherRequest request) {
        return teacherService.update(id, request.getSpecialities())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeacher(@PathVariable Long id) {
        teacherService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/specialities")
    public ResponseEntity<Teacher> addSpeciality(@PathVariable Long id, @RequestParam String speciality) {
        return teacherService.addSpeciality(id, speciality)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}/specialities")
    public ResponseEntity<Teacher> removeSpeciality(@PathVariable Long id, @RequestParam String speciality) {
        return teacherService.removeSpeciality(id, speciality)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Récupère le Teacher de l'utilisateur connecté
     */
    @GetMapping("/current")
    public ResponseEntity<Teacher> getCurrentTeacher() {
        System.out.println("DEBUG: TeacherController.getCurrentTeacher() appelé");
        Teacher teacher = teacherService.getCurrentTeacher();
        System.out.println("DEBUG: Teacher récupéré: " + teacher);
        if (teacher == null) {
            System.out.println("DEBUG: Teacher est null, retour 404");
            return ResponseEntity.notFound().build();
        }
        System.out.println("DEBUG: Teacher trouvé, retour 200");
        return ResponseEntity.ok(teacher);
    }

    /**
     * Récupère un Teacher par son userId
     */
    @GetMapping("/by-user/{userId}")
    public ResponseEntity<Teacher> getTeacherByUserId(@PathVariable Long userId) {
        System.out.println("DEBUG: TeacherController.getTeacherByUserId() appelé avec userId=" + userId);
        return teacherService.getByUserId(userId)
                .map(teacher -> {
                    System.out.println("DEBUG: Teacher trouvé pour userId=" + userId);
                    return ResponseEntity.ok(teacher);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
