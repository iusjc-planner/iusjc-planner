package com.example.iusj_event_service.services;

import com.example.iusj_event_service.entities.Evenement;
import com.example.iusj_event_service.repositories.EvenementRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EvenementServiceTest {

    @Mock
    private EvenementRepository evenementRepository;

    @Mock
    private RoomClient roomClient;

    @Mock
    private NotificationClient notificationClient;

    @InjectMocks
    private EvenementService evenementService;

    private Evenement testEvent;

    @BeforeEach
    void setUp() {
        testEvent = new Evenement();
        testEvent.setId(1L);
        testEvent.setNom("Reunion test");
        testEvent.setType(Evenement.EventType.REUNION);
        testEvent.setDate(LocalDate.now());
        testEvent.setHeureDebut(LocalTime.of(10, 0));
        testEvent.setDuree(60);
        testEvent.setOrganisateurId(10L);
        testEvent.setSalleId(5L);
        testEvent.setStatus(Evenement.EventStatus.PLANIFIE);
    }

    @Test
    void testGetAll() {
        when(evenementRepository.findAll(any(Specification.class), any(Sort.class)))
                .thenReturn(List.of(testEvent));

        List<Evenement> result = evenementService.getAll(null, null, null, null, null, null, null);

        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void testGetByIdSuccess() {
        when(evenementRepository.findById(1L)).thenReturn(Optional.of(testEvent));
        Evenement result = evenementService.getById(1L);
        assertNotNull(result);
        assertEquals("Reunion test", result.getNom());
    }

    @Test
    void testGetByIdNotFound() {
        when(evenementRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> evenementService.getById(99L));
    }

    @Test
    void testCreateSuccessAdmin() {
        when(roomClient.isRoomActive(5L)).thenReturn(true);
        when(roomClient.isRoomAvailable(eq(5L), any(LocalDate.class), any(LocalTime.class), eq(60))).thenReturn(true);
        when(roomClient.reserveRoom(any(), any(), any(), any(), any(), any())).thenReturn(100L);
        when(evenementRepository.save(any(Evenement.class))).thenAnswer(i -> {
            Evenement e = i.getArgument(0);
            e.setId(2L);
            return e;
        });

        Evenement result = evenementService.create(testEvent, 1L, "ADMIN");

        assertNotNull(result);
        assertEquals(2L, result.getId());
        verify(notificationClient).notifyParticipants(any(), anyString(), eq(2L), eq(1L));
    }

    @Test
    void testCreateForbiddenTeacher() {
        testEvent.setType(Evenement.EventType.EXAMEN); // Teacher cannot create EXAMEN
        assertThrows(ResponseStatusException.class, () -> evenementService.create(testEvent, 10L, "ENSEIGNANT"));
    }

    @Test
    void testUpdateSuccess() {
        Evenement updateEvent = new Evenement();
        updateEvent.setNom("Updated");
        updateEvent.setType(Evenement.EventType.REUNION);
        updateEvent.setDate(LocalDate.now());
        updateEvent.setHeureDebut(LocalTime.of(11, 0)); // Schedule change
        updateEvent.setDuree(60);
        updateEvent.setOrganisateurId(10L);
        updateEvent.setSalleId(5L);

        when(evenementRepository.findById(1L)).thenReturn(Optional.of(testEvent));
        when(roomClient.isRoomActive(5L)).thenReturn(true);
        when(roomClient.isRoomAvailable(eq(5L), any(LocalDate.class), any(LocalTime.class), eq(60))).thenReturn(true);
        when(evenementRepository.save(any(Evenement.class))).thenReturn(updateEvent);

        Evenement result = evenementService.update(1L, updateEvent, 1L, "ADMIN");

        assertNotNull(result);
        verify(roomClient).cancelReservation(any(), any());
        verify(roomClient).reserveRoom(any(), any(), any(), any(), any(), any());
    }

    @Test
    void testCancelSuccess() {
        when(evenementRepository.findById(1L)).thenReturn(Optional.of(testEvent));
        when(evenementRepository.save(any(Evenement.class))).thenReturn(testEvent);

        Evenement result = evenementService.cancel(1L, 1L, "ADMIN");

        assertEquals(Evenement.EventStatus.ANNULE, result.getStatus());
        verify(roomClient).cancelReservation(any(), any());
    }

    @Test
    void testDeleteSuccess() {
        when(evenementRepository.findById(1L)).thenReturn(Optional.of(testEvent));

        evenementService.delete(1L, 1L, "ADMIN");

        verify(roomClient).cancelReservation(any(), any());
        verify(evenementRepository).deleteById(1L);
    }
}
