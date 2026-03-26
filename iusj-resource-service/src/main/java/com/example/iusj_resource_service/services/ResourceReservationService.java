package com.example.iusj_resource_service.services;

import com.example.iusj_resource_service.dto.ReservationRequest;
import com.example.iusj_resource_service.entities.Resource;
import com.example.iusj_resource_service.entities.ResourceReservation;
import com.example.iusj_resource_service.entities.ResourceReservation.ReservationStatus;
import com.example.iusj_resource_service.repositories.ResourceReservationRepository;
import com.example.iusj_resource_service.repositories.ResourceRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@Slf4j
public class ResourceReservationService {

    private final ResourceReservationRepository reservationRepository;
    private final ResourceRepository resourceRepository;

    public ResourceReservationService(
            ResourceReservationRepository reservationRepository,
            ResourceRepository resourceRepository
    ) {
        this.reservationRepository = reservationRepository;
        this.resourceRepository = resourceRepository;
    }

    /**
     * Reserve a resource
     */
    public ResourceReservation reserve(Long resourceId, ReservationRequest request, Long userId) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new EntityNotFoundException("Resource not found with id " + resourceId));

        if (resource.getStatus() != Resource.Status.ACTIVE) {
            throw new IllegalArgumentException("Resource is not available for reservation");
        }

        // Check quantity
        int availableQuantity = getAvailableQuantity(resourceId, request.getDate(), request.getHeureDebut());
        if (availableQuantity < request.getQuantite()) {
            throw new IllegalArgumentException("Not enough quantity available. Only " + availableQuantity + " available");
        }

        // Check for conflicts
        List<ResourceReservation> conflicts = reservationRepository.findConflictingReservations(
                resourceId,
                request.getDate(),
                request.getHeureDebut(),
                request.getHeureDebut().plusMinutes(request.getDuree()),
                Arrays.asList(ReservationStatus.PENDING, ReservationStatus.CONFIRMED)
        );

        if (!conflicts.isEmpty()) {
            // Sum up conflicting quantities
            int conflictingQuantity = conflicts.stream()
                    .mapToInt(ResourceReservation::getQuantite)
                    .sum();
            int canReserve = resource.getQuantityTotal() - conflictingQuantity;
            if (canReserve < request.getQuantite()) {
                throw new IllegalArgumentException("Time slot conflict. Cannot reserve " + request.getQuantite() + " units");
            }
        }

        ResourceReservation reservation = new ResourceReservation();
        reservation.setResource(resource);
        reservation.setDate(request.getDate());
        reservation.setHeureDebut(request.getHeureDebut());
        reservation.setDuree(request.getDuree());
        reservation.setReservePar(userId);
        reservation.setQuantite(request.getQuantite());
        reservation.setMotif(request.getMotif());
        reservation.setDateRetourPrevue(request.getDateRetourPrevue());
        reservation.setStatus(ReservationStatus.CONFIRMED);

        ResourceReservation saved = reservationRepository.save(reservation);
        log.info("Reservation created: {} for resource: {} by user: {}", saved.getId(), resourceId, userId);

        return saved;
    }

    /**
     * Cancel a reservation
     */
    public void cancel(Long reservationId) {
        ResourceReservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Reservation not found with id " + reservationId));

        if (reservation.getStatus() == ReservationStatus.RETURNED || 
            reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new IllegalArgumentException("Cannot cancel a " + reservation.getStatus() + " reservation");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);
        log.info("Reservation cancelled: {}", reservationId);
    }

    /**
     * Mark a reservation as returned
     */
    public void markReturned(Long reservationId) {
        ResourceReservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Reservation not found with id " + reservationId));

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new IllegalArgumentException("Cannot mark as returned a cancelled reservation");
        }

        reservation.setStatus(ReservationStatus.RETURNED);
        reservation.setDateRetourEffective(LocalDateTime.now());
        reservationRepository.save(reservation);
        log.info("Reservation marked as returned: {}", reservationId);
    }

    /**
     * Get available quantity for a resource at a specific date and time
     */
    public int getAvailableQuantity(Long resourceId, LocalDate date, LocalTime time) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new EntityNotFoundException("Resource not found with id " + resourceId));

        List<ResourceReservation> activeReservations = reservationRepository.findActiveReservations(
                resourceId,
                Arrays.asList(ReservationStatus.CONFIRMED, ReservationStatus.PENDING)
        );

        // Filter for overlapping reservations
        int reservedQuantity = activeReservations.stream()
                .filter(r -> r.getDate().equals(date))
                .filter(r -> isTimeOverlap(time, time.plusMinutes(1), r.getHeureDebut(), 
                        r.getHeureDebut().plusMinutes(r.getDuree())))
                .mapToInt(ResourceReservation::getQuantite)
                .sum();

        return resource.getQuantityTotal() - reservedQuantity;
    }

    /**
     * Check availability for a resource at a specific date and time
     */
    public boolean isAvailable(Long resourceId, LocalDate date, LocalTime time, int requestedQuantity) {
        return getAvailableQuantity(resourceId, date, time) >= requestedQuantity;
    }

    /**
     * Get all reservations for a resource
     */
    public List<ResourceReservation> getReservationsByResource(Long resourceId) {
        return reservationRepository.findByResourceId(resourceId);
    }

    /**
     * Get all reservations by user
     */
    public List<ResourceReservation> getReservationsByUser(Long userId) {
        return reservationRepository.findByReservePar(userId);
    }

    /**
     * Get reservation by ID
     */
    public Optional<ResourceReservation> getReservationById(Long reservationId) {
        return reservationRepository.findById(reservationId);
    }

    /**
     * Helper method to check time overlap
     */
    private boolean isTimeOverlap(LocalTime start1, LocalTime end1, LocalTime start2, LocalTime end2) {
        return !end1.isBefore(start2) && !start1.isAfter(end2);
    }

    /**
     * Get reservations for a resource on a specific date
     */
    public List<ResourceReservation> getReservationsByResourceAndDate(Long resourceId, LocalDate date) {
        return reservationRepository.findByResourceIdAndDate(resourceId, date);
    }
}
