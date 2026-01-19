package com.example.iusj_teacher_service.controller;

import com.example.iusj_teacher_service.entities.Teacher;
import com.example.iusj_teacher_service.services.TeacherService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
