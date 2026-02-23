package com.example.iusj_resource_service.controller;

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

import com.example.iusj_resource_service.entities.Resource;
import com.example.iusj_resource_service.services.ResourceService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    private final ResourceService service;

    public ResourceController(ResourceService service) {
        this.service = service;
    }

    @GetMapping
    public List<Resource> list(@RequestParam(required = false) String name,
                               @RequestParam(required = false) String type,
                               @RequestParam(required = false) Resource.Status status) {
        return service.getAll(name, type, status);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> get(@PathVariable Long id) {
        return service.getById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Resource> create(@Valid @RequestBody Resource resource) {
        return ResponseEntity.ok(service.create(resource));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Resource> update(@PathVariable Long id, @Valid @RequestBody Resource resource) {
        return service.update(id, resource).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResourceService.ResourceStats stats() {
        return service.stats();
    }
}
