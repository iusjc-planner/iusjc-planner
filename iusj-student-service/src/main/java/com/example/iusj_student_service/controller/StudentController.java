package com.example.iusj_student_service.controller;

import java.util.List;

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

import com.example.iusj_student_service.dto.StudentRequest;
import com.example.iusj_student_service.dto.StudentResponse;
import com.example.iusj_student_service.entities.Student;
import com.example.iusj_student_service.services.StudentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService service;

    public StudentController(StudentService service) {
        this.service = service;
    }

    @GetMapping
    public List<StudentResponse> list(@RequestParam(required = false) String matricule,
                                      @RequestParam(required = false) String nom,
                                      @RequestParam(required = false) String prenom,
                                      @RequestParam(required = false) String email,
                                      @RequestParam(required = false) Student.Status status,
                                      @RequestParam(required = false) Long groupId) {
        return service.getAll(matricule, nom, prenom, email, status, groupId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentResponse> get(@PathVariable Long id) {
        return service.getById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<StudentResponse> create(@Valid @RequestBody StudentRequest request) {
        return ResponseEntity.ok(service.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentResponse> update(@PathVariable Long id,
                                                  @Valid @RequestBody StudentRequest request) {
        return service.update(id, request).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/groups/{groupId}")
    public ResponseEntity<StudentResponse> addGroup(@PathVariable Long id, @PathVariable Long groupId) {
        return service.addGroup(id, groupId).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}/groups/{groupId}")
    public ResponseEntity<StudentResponse> removeGroup(@PathVariable Long id, @PathVariable Long groupId) {
        return service.removeGroup(id, groupId).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
}
