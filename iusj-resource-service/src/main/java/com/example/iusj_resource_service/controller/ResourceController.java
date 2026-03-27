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
import com.example.iusj_resource_service.dto.ReservationRequest;
import com.example.iusj_resource_service.entities.ResourceReservation;
import com.example.iusj_resource_service.services.ResourceReservationService;
import java.time.LocalDate;
import java.time.LocalTime;
import jakarta.persistence.EntityNotFoundException;

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

        // ============ RESERVATION ENDPOINTS ============

        @PostMapping("/{id}/reserve")
        public ResponseEntity<ResourceReservation> reserve(
                @PathVariable Long id,
                @Valid @RequestBody ReservationRequest request,
                @RequestParam Long userId) {
            try {
                ResourceReservation reservation = reservationService.reserve(id, request, userId);
                return ResponseEntity.ok(reservation);
            } catch (EntityNotFoundException e) {
                return ResponseEntity.notFound().build();
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        }

        @GetMapping("/{id}/reservations")
        public List<ResourceReservation> getReservationsByResource(@PathVariable Long id) {
            return reservationService.getReservationsByResource(id);
        }

        @GetMapping("/{id}/reservations/date")
        public List<ResourceReservation> getReservationsByResourceAndDate(
                @PathVariable Long id,
                @RequestParam LocalDate date) {
            return reservationService.getReservationsByResourceAndDate(id, date);
        }

        @GetMapping("/{id}/availability")
        public ResponseEntity<Integer> checkAvailability(
                @PathVariable Long id,
                @RequestParam LocalDate date,
                @RequestParam LocalTime time) {
            try {
                int available = reservationService.getAvailableQuantity(id, date, time);
                return ResponseEntity.ok(available);
            } catch (EntityNotFoundException e) {
                return ResponseEntity.notFound().build();
            }
        }

        @PutMapping("/reservations/{id}/cancel")
        public ResponseEntity<Void> cancelReservation(@PathVariable Long id) {
            try {
                reservationService.cancel(id);
                return ResponseEntity.noContent().build();
            } catch (EntityNotFoundException e) {
                return ResponseEntity.notFound().build();
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        }

        @PutMapping("/reservations/{id}/return")
        public ResponseEntity<Void> markAsReturned(@PathVariable Long id) {
            try {
                reservationService.markReturned(id);
                return ResponseEntity.noContent().build();
            } catch (EntityNotFoundException e) {
                return ResponseEntity.notFound().build();
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        }

        @GetMapping("/reservations/user/{userId}")
        public List<ResourceReservation> getReservationsByUser(@PathVariable Long userId) {
            return reservationService.getReservationsByUser(userId);
        }

        @GetMapping("/reservations/{id}")
        public ResponseEntity<ResourceReservation> getReservation(@PathVariable Long id) {
            return reservationService.getReservationById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        }
}
