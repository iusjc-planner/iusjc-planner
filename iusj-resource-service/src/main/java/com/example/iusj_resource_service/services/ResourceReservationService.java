package com.example.iusj_resource_service.services;

import com.example.iusj_resource_service.dto.ReservationRequest;
import com.example.iusj_resource_service.entities.Resource;
import com.example.iusj_resource_service.entities.ResourceReservation;
import com.example.iusj_resource_service.repositories.ResourceRepository;
import com.example.iusj_resource_service.repositories.ResourceReservationRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ResourceReservationService {

    private final ResourceRepository resourceRepository;
    private final ResourceReservationRepository reservationRepository;

    public ResourceReservationService(ResourceRepository resourceRepository,
                                       ResourceReservationRepository reservationRepository) {
        this.resourceRepository = resourceRepository;
        this.reservationRepository = reservationRepository;
    }

    /**
     * Réserve une quantité d'une ressource pour un créneau donné.
     */
    public ResourceReservation reserve(Long resourceId, ReservationRequest request, Long userId) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new EntityNotFoundException("Ressource introuvable: " + resourceId));

        if (request.getHeureFin().isBefore(request.getHeureDebut()) ||
            request.getHeureFin().equals(request.getHeureDebut())) {
            throw new IllegalArgumentException("L'heure de fin doit être après l'heure de début");
        }

        // Calculer la quantité déjà réservée sur ce créneau
        List<ResourceReservation> conflicts = reservationRepository.findConflictingReservations(
                resourceId,
                List.of(ResourceReservation.ReservationStatus.CONFIRMED, ResourceReservation.ReservationStatus.PENDING),
                request.getDate(),
                request.getHeureDebut(),
                request.getHeureFin()
        );

        int alreadyReserved = conflicts.stream().mapToInt(ResourceReservation::getQuantite).sum();
        int available = resource.getQuantite() - alreadyReserved;

        if (request.getQuantite() > available) {
            throw new IllegalArgumentException(
                String.format("Quantite insuffisante : %d disponible(s), %d demande(s)",
                    available, request.getQuantite()));
        }

        ResourceReservation reservation = new ResourceReservation();
        reservation.setResourceId(resourceId);
        reservation.setDate(request.getDate());
        reservation.setHeureDebut(request.getHeureDebut());
        reservation.setHeureFin(request.getHeureFin());
        reservation.setQuantite(request.getQuantite());
        reservation.setReservePar(userId);
        reservation.setMotif(request.getMotif());
        reservation.setStatus(ResourceReservation.ReservationStatus.CONFIRMED);

        // Mettre à jour le statut de la ressource si tout est réservé
        if (available - request.getQuantite() == 0) {
            resource.setStatut(Resource.StatutRessource.RESERVE);
            resourceRepository.save(resource);
        }

        return reservationRepository.save(reservation);
    }

    /**
     * Annule une réservation.
     */
    public void cancel(Long reservationId, Long userId) {
        ResourceReservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Reservation introuvable: " + reservationId));

        reservation.setStatus(ResourceReservation.ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);

        // Remettre la ressource disponible si plus aucune réservation active
        List<ResourceReservation> active = reservationRepository.findActiveReservations(
                reservation.getResourceId(),
                List.of(ResourceReservation.ReservationStatus.CONFIRMED, ResourceReservation.ReservationStatus.PENDING)
        );
        if (active.isEmpty()) {
            resourceRepository.findById(reservation.getResourceId()).ifPresent(r -> {
                r.setStatut(Resource.StatutRessource.DISPONIBLE);
                resourceRepository.save(r);
            });
        }
    }

    /**
     * Liste les réservations d'une ressource.
     */
    @Transactional(readOnly = true)
    public List<ResourceReservation> getByResource(Long resourceId) {
        return reservationRepository.findByResourceId(resourceId);
    }

    /**
     * Vérifie la disponibilité d'une ressource pour un créneau.
     */
    @Transactional(readOnly = true)
    public int getAvailableQuantity(Long resourceId, ReservationRequest request) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new EntityNotFoundException("Ressource introuvable: " + resourceId));

        List<ResourceReservation> conflicts = reservationRepository.findConflictingReservations(
                resourceId,
                List.of(ResourceReservation.ReservationStatus.CONFIRMED, ResourceReservation.ReservationStatus.PENDING),
                request.getDate(),
                request.getHeureDebut(),
                request.getHeureFin()
        );

        int alreadyReserved = conflicts.stream().mapToInt(ResourceReservation::getQuantite).sum();
        return Math.max(0, resource.getQuantite() - alreadyReserved);
    }
}
