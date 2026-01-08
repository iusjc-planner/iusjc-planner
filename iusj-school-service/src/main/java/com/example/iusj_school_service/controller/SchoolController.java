package com.example.iusj_school_service.controller;

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

import com.example.iusj_school_service.entities.School;
import com.example.iusj_school_service.services.SchoolService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/schools")
public class SchoolController {

    private final SchoolService service;

    public SchoolController(SchoolService service) {
        this.service = service;
    }

    @GetMapping
    public List<School> list(@RequestParam(required = false) String name,
                             @RequestParam(required = false) School.Status status) {
        return service.getAll(name, status);
    }

    @GetMapping("/{id}")
    public ResponseEntity<School> get(@PathVariable Long id) {
        return service.getById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<School> create(@Valid @RequestBody School school) {
        return ResponseEntity.ok(service.create(school));
    }

    @PutMapping("/{id}")
    public ResponseEntity<School> update(@PathVariable Long id, @Valid @RequestBody School school) {
        return service.update(id, school).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public SchoolService.SchoolStats stats() {
        return service.stats();
    }
}
