package com.example.iusj_group_service.controller;

import java.util.List;

import com.example.iusj_group_service.dto.SplitGroupRequest;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.iusj_group_service.entities.Group;
import com.example.iusj_group_service.services.GroupService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    private final GroupService service;

    public GroupController(GroupService service) {
        this.service = service;
    }

    @GetMapping
    public List<Group> list(@RequestParam(required = false) String name,
                            @RequestParam(required = false) String level,
                            @RequestParam(required = false) Long schoolId,
                            @RequestParam(required = false) Long filiereId,
                            @RequestParam(required = false) Group.Status status) {
        return service.getAll(name, level, schoolId, filiereId, status);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Group> get(@PathVariable Long id) {
        return service.getById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Group> create(@Valid @RequestBody Group group) {
        return ResponseEntity.ok(service.create(group));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Group> update(@PathVariable Long id, @Valid @RequestBody Group group) {
        return service.update(id, group).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/split")
    public ResponseEntity<List<Group>> split(@PathVariable Long id, @Valid @RequestBody SplitGroupRequest request) {
        return ResponseEntity.ok(service.split(id, request.getCount(), request.getType()));
    }

    @GetMapping("/{id}/subgroups")
    public ResponseEntity<List<Group>> subgroups(@PathVariable Long id) {
        return ResponseEntity.ok(service.getSubGroups(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public GroupService.GroupStats stats() {
        return service.stats();
    }

    @GetMapping("/filiere/{filiereId}")
    public List<Group> getByFiliere(@PathVariable Long filiereId) {
        return service.getByFiliere(filiereId);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<String> handleEntityNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(404).body(ex.getMessage());
    }
}
