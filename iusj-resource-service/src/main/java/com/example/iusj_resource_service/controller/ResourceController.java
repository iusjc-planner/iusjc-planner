package com.example.iusj_resource_service.controller;

import com.example.iusj_resource_service.dto.ReservationRequest;
import com.example.iusj_resource_service.entities.Resource;
import com.example.iusj_resource_service.entities.ResourceReservation;
import com.example.iusj_resource_service.services.ResourceReservationService;
import com.example.iusj_resource_service.services.ResourceService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    private final ResourceService service;
    private final ResourceReservationService reservationService;

    public ResourceController(ResourceService service, ResourceReservationService reservationService) {
        this.service = service;
        this.reservationService = reservationService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public List<Resource> list(
            @RequestParam(required = false) String nom,
            @RequestParam(required = false) Resource.TypeRessource type,
            @RequestParam(required = false) Resource.StatutRessource statut) {
        return service.getAll(nom, type, statut);
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResourceService.ResourceStats stats() {
        return service.getStats();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<Resource> get(@PathVariable Long id) {
        return service.getById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Resource> create(@Valid @RequestBody Resource resource) {
        return ResponseEntity.ok(service.create(resource));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Resource> update(@PathVariable Long id, @Valid @RequestBody Resource resource) {
        return service.update(id, resource).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            service.delete(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ===== Réservations =====

    @PostMapping("/{id}/reservations")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<?> reserve(
            @PathVariable Long id,
            @Valid @RequestBody ReservationRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        try {
            ResourceReservation reservation = reservationService.reserve(id, request, userId);
            return ResponseEntity.ok(reservation);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}/reservations")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<ResourceReservation>> getReservations(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.getByResource(id));
    }

    @PostMapping("/{id}/availability")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<?> checkAvailability(
            @PathVariable Long id,
            @Valid @RequestBody ReservationRequest request) {
        try {
            int available = reservationService.getAvailableQuantity(id, request);
            return ResponseEntity.ok(java.util.Map.of("available", available));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/reservations/{reservationId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Void> cancelReservation(
            @PathVariable Long reservationId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        try {
            reservationService.cancel(reservationId, userId);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
