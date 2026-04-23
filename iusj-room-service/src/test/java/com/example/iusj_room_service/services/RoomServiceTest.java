package com.example.iusj_room_service.services;

import com.example.iusj_room_service.dto.RoomReservationRequest;
import com.example.iusj_room_service.entities.Room;
import com.example.iusj_room_service.entities.RoomEquipment;
import com.example.iusj_room_service.entities.RoomReservation;
import com.example.iusj_room_service.repositories.RoomEquipmentRepository;
import com.example.iusj_room_service.repositories.RoomRepository;
import com.example.iusj_room_service.repositories.RoomReservationRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.domain.Sort;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RoomServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private RoomEquipmentRepository roomEquipmentRepository;

    @Mock
    private RoomReservationRepository reservationRepository;

    @InjectMocks
    private RoomService roomService;

    @Test
    void deleteShouldThrowWhenRoomDoesNotExist() {
        when(roomRepository.existsById(99L)).thenReturn(false);

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () -> roomService.delete(99L));
        assertTrue(ex.getMessage().contains("Room not found"));
        verify(roomRepository, never()).deleteById(99L);
    }

    @Test
    void addEquipmentShouldCreateWhenMissing() {
        when(roomRepository.existsById(1L)).thenReturn(true);
        when(roomEquipmentRepository.findByRoomIdAndResourceId(1L, 100L)).thenReturn(Optional.empty());
        when(roomEquipmentRepository.save(any(RoomEquipment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RoomEquipment result = roomService.addEquipment(1L, 100L, 2);

        assertEquals(1L, ReflectionTestUtils.getField(result, "roomId"));
        assertEquals(100L, ReflectionTestUtils.getField(result, "resourceId"));
        assertEquals(2, ReflectionTestUtils.getField(result, "quantite"));
    }

    @Test
    void reserveShouldThrowOnConflict() {
        when(roomRepository.existsById(1L)).thenReturn(true);
        when(reservationRepository.existsConflict(
                eq(1L), any(), any(LocalDateTime.class), any(LocalDateTime.class)
        )).thenReturn(true);

        RoomReservationRequest request = new RoomReservationRequest();
        ReflectionTestUtils.setField(request, "startTime", LocalDateTime.of(2026, 4, 25, 10, 0));
        ReflectionTestUtils.setField(request, "endTime", LocalDateTime.of(2026, 4, 25, 12, 0));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> roomService.reserve(1L, request));
        assertTrue(ex.getMessage().contains("already reserved"));
        verify(reservationRepository, never()).save(any(RoomReservation.class));
    }

    @Test
    void reserveShouldPersistReservationWhenNoConflict() {
        when(roomRepository.existsById(1L)).thenReturn(true);
        when(reservationRepository.existsConflict(
                eq(1L), any(), any(LocalDateTime.class), any(LocalDateTime.class)
        )).thenReturn(false);
        when(reservationRepository.save(any(RoomReservation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RoomReservationRequest request = new RoomReservationRequest();
        ReflectionTestUtils.setField(request, "startTime", LocalDateTime.of(2026, 4, 25, 10, 0));
        ReflectionTestUtils.setField(request, "endTime", LocalDateTime.of(2026, 4, 25, 12, 0));
        ReflectionTestUtils.setField(request, "reservedByUserId", 7L);
        ReflectionTestUtils.setField(request, "purpose", "Cours de test");

        RoomReservation result = roomService.reserve(1L, request);

        assertEquals(1L, ReflectionTestUtils.getField(result, "roomId"));
        assertEquals(RoomReservation.Status.RESERVED, ReflectionTestUtils.getField(result, "status"));
        assertEquals(7L, ReflectionTestUtils.getField(result, "reservedByUserId"));
    }

    @Test
    void cancelReservationShouldSetCancelledStatus() {
        RoomReservation reservation = new RoomReservation();
        ReflectionTestUtils.setField(reservation, "id", 2L);
        ReflectionTestUtils.setField(reservation, "roomId", 1L);
        ReflectionTestUtils.setField(reservation, "status", RoomReservation.Status.RESERVED);

        when(reservationRepository.findById(2L)).thenReturn(Optional.of(reservation));

        roomService.cancelReservation(1L, 2L);

        ArgumentCaptor<RoomReservation> captor = ArgumentCaptor.forClass(RoomReservation.class);
        verify(reservationRepository).save(captor.capture());
        assertEquals(RoomReservation.Status.CANCELLED, ReflectionTestUtils.getField(captor.getValue(), "status"));
    }

    @Test
    void findAvailableShouldFilterOutReservedRooms() {
        Room room1 = new Room();
        ReflectionTestUtils.setField(room1, "id", 1L);
        ReflectionTestUtils.setField(room1, "name", "A1");
        Room room2 = new Room();
        ReflectionTestUtils.setField(room2, "id", 2L);
        ReflectionTestUtils.setField(room2, "name", "A2");

        when(roomRepository.findAll(any(Specification.class), any(Sort.class))).thenReturn(List.of(room1, room2));
        when(reservationRepository.findReservedRoomIds(any(), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(2L));

        List<Room> available = roomService.findAvailable(
                LocalDateTime.of(2026, 4, 25, 10, 0),
                LocalDateTime.of(2026, 4, 25, 12, 0),
                null,
                null
        );

        assertEquals(1, available.size());
        assertEquals(1L, ReflectionTestUtils.getField(available.get(0), "id"));
        assertTrue(available.stream().noneMatch(r -> 2L == (Long) ReflectionTestUtils.getField(r, "id")));
    }
}
