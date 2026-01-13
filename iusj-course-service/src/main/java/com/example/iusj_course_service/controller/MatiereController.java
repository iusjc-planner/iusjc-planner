package com.example.iusj_course_service.controller;

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

import com.example.iusj_course_service.entities.Matiere;
import com.example.iusj_course_service.services.MatiereService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/matieres")
public class MatiereController {

    private final MatiereService matiereService;

    public MatiereController(MatiereService matiereService) {
        this.matiereService = matiereService;
    }

    @GetMapping
    public List<Matiere> listMatieres(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String nom,
            @RequestParam(required = false) Matiere.MatiereStatus status,
            @RequestParam(required = false) Long schoolId,
            @RequestParam(required = false) Long filiereId,
            @RequestParam(required = false) Long teacherId) {
        return matiereService.getAll(code, nom, status, schoolId, filiereId, teacherId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Matiere> getMatiere(@PathVariable Long id) {
        return matiereService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<Matiere> getMatiereByCode(@PathVariable String code) {
        return matiereService.getByCode(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/school/{schoolId}")
    public List<Matiere> getMatieresBySchool(@PathVariable Long schoolId) {
        return matiereService.getBySchoolId(schoolId);
    }

    @GetMapping("/filiere/{filiereId}")
    public List<Matiere> getMatieresByFiliere(@PathVariable Long filiereId) {
        return matiereService.getByFiliereId(filiereId);
    }

    @GetMapping("/teacher/{teacherId}")
    public List<Matiere> getMatieresByTeacher(@PathVariable Long teacherId) {
        return matiereService.getByTeacherId(teacherId);
    }

    @PostMapping
    public ResponseEntity<Matiere> createMatiere(@Valid @RequestBody Matiere matiere) {
        return ResponseEntity.ok(matiereService.create(matiere));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Matiere> updateMatiere(@PathVariable Long id, @Valid @RequestBody Matiere matiere) {
        return matiereService.update(id, matiere)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMatiere(@PathVariable Long id) {
        matiereService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public MatiereService.MatiereStats stats() {
        return matiereService.stats();
    }
}
