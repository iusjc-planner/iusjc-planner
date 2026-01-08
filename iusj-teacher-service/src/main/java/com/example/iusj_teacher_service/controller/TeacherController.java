package com.example.iusj_teacher_service.controller;

import com.example.iusj_teacher_service.entities.Teacher;
import com.example.iusj_teacher_service.services.TeacherService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teachers")
public class TeacherController {

    private final TeacherService teacherService;

    public TeacherController(TeacherService teacherService) {
        this.teacherService = teacherService;
    }

    @GetMapping
    public List<Teacher> getAllTeachers() {
        return teacherService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Teacher> getTeacherById(@PathVariable Long id) {
        return teacherService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Teacher> createTeacher(@Valid @RequestBody Teacher teacher) {
        Teacher created = teacherService.create(teacher);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Teacher> updateTeacher(@PathVariable Long id, @Valid @RequestBody Teacher teacher) {
        return teacherService.update(id, teacher)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeacher(@PathVariable Long id) {
        teacherService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/by-status/{status}")
    public ResponseEntity<List<Teacher>> getByStatus(@PathVariable String status) {
        try {
            Teacher.Status teacherStatus = Teacher.Status.valueOf(status.toUpperCase());
            return ResponseEntity.ok(teacherService.findByStatus(teacherStatus));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/by-grade/{grade}")
    public ResponseEntity<List<Teacher>> getByGrade(@PathVariable String grade) {
        try {
            Teacher.Grade teacherGrade = Teacher.Grade.valueOf(grade.toUpperCase());
            return ResponseEntity.ok(teacherService.findByGrade(teacherGrade));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Teacher>> searchTeachers(@RequestParam(required = false) String nom,
                                                        @RequestParam(required = false) String prenom,
                                                        @RequestParam(required = false) String specialite,
                                                        @RequestParam(required = false) String email) {
        return ResponseEntity.ok(teacherService.search(nom, prenom, specialite, email));
    }
}
