package com.example.iusj_resource_service.services;

import com.example.iusj_resource_service.dto.ReservationRequest;
import com.example.iusj_resource_service.entities.Resource;
import com.example.iusj_resource_service.entities.ResourceReservation;
import com.example.iusj_resource_service.repositories.ResourceRepository;
import com.example.iusj_resource_service.repositories.ResourceReservationRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ResourceReservationServiceTest {

    @Mock
    private ResourceReservationRepository reservationRepository;

    @Mock
    private ResourceRepository resourceRepository;

    @InjectMocks
    private ResourceReservationService service;

    private Resource resource;
    private ReservationRequest request;

    @BeforeEach
    void setUp() {
        resource = new Resource();
        resource.setId(10L);
        resource.setStatus(Resource.Status.ACTIVE);
        resource.setQuantityTotal(5);

        request = new ReservationRequest();
        request.setDate(LocalDate.of(2026, 3, 25));
        request.setHeureDebut(LocalTime.of(14, 0));
        request.setDuree(120);
        request.setQuantite(2);
        request.setMotif("Cours");
    }

    @Test
    void reserve_ShouldCreateReservation_WhenQuantityAvailable() {
        when(resourceRepository.findById(10L)).thenReturn(Optional.of(resource));
        when(reservationRepository.findActiveReservations(10L, List.of(ResourceReservation.ReservationStatus.CONFIRMED, ResourceReservation.ReservationStatus.PENDING)))
                .thenReturn(List.of());
        when(reservationRepository.findConflictingReservations(any(), any(), any(), any(), any())).thenReturn(List.of());
        when(reservationRepository.save(any(ResourceReservation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResourceReservation reservation = service.reserve(10L, request, 99L);

        assertEquals(99L, reservation.getReservePar());
        assertEquals(ResourceReservation.ReservationStatus.CONFIRMED, reservation.getStatus());
        assertEquals(2, reservation.getQuantite());
    }

    @Test
    void reserve_ShouldThrow_WhenResourceNotFound() {
        when(resourceRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> service.reserve(999L, request, 1L));
    }

    @Test
    void reserve_ShouldThrow_WhenInsufficientQuantity() {
        when(resourceRepository.findById(10L)).thenReturn(Optional.of(resource));

        ResourceReservation existing = new ResourceReservation();
        existing.setDate(request.getDate());
        existing.setHeureDebut(request.getHeureDebut());
        existing.setDuree(120);
        existing.setQuantite(4);

        when(reservationRepository.findActiveReservations(10L, List.of(ResourceReservation.ReservationStatus.CONFIRMED, ResourceReservation.ReservationStatus.PENDING)))
                .thenReturn(List.of(existing));

        assertThrows(IllegalArgumentException.class, () -> service.reserve(10L, request, 1L));
    }
}
