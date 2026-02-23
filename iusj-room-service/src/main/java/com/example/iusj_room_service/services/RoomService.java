package com.example.iusj_room_service.services;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import com.example.iusj_room_service.dto.RoomReservationRequest;
import com.example.iusj_room_service.entities.Room;
import com.example.iusj_room_service.entities.RoomReservation;
import com.example.iusj_room_service.repositories.RoomRepository;
import com.example.iusj_room_service.repositories.RoomReservationRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
@Transactional
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomReservationRepository reservationRepository;

    public RoomService(RoomRepository roomRepository, RoomReservationRepository reservationRepository) {
        this.roomRepository = roomRepository;
        this.reservationRepository = reservationRepository;
    }

    public List<Room> getAll(String name, Room.RoomType type, Room.RoomStatus status, Integer minCapacity, List<String> equipments) {
        Specification<Room> spec = RoomSpecifications.withFilters(name, type, status, minCapacity, equipments);
        return roomRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "name"));
    }

    public Optional<Room> getById(Long id) {
        return roomRepository.findById(id);
    }

    public Room create(Room room) {
        return roomRepository.save(room);
    }

    public Optional<Room> update(Long id, Room room) {
        return roomRepository.findById(id).map(existing -> {
            room.setId(id);
            return roomRepository.save(room);
        });
    }

    public void delete(Long id) {
        if (!roomRepository.existsById(id)) {
            throw new EntityNotFoundException("Room not found with id " + id);
        }
        roomRepository.deleteById(id);
    }

    public List<Room> findAvailable(LocalDateTime start, LocalDateTime end, Integer minCapacity, List<String> equipments) {
        List<String> eq = CollectionUtils.isEmpty(equipments) ? Collections.emptyList() : equipments;
        Specification<Room> spec = RoomSpecifications.withFilters(null, null, Room.RoomStatus.ACTIVE, minCapacity, eq);
        List<Room> rooms = roomRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "name"));
        List<Long> reservedRoomIds = reservationRepository.findReservedRoomIds(
                List.of(RoomReservation.Status.RESERVED, RoomReservation.Status.CONFIRMED), start, end);
        if (reservedRoomIds.isEmpty()) {
            return rooms;
        }
        return rooms.stream().filter(room -> !reservedRoomIds.contains(room.getId())).toList();
    }

    public List<RoomReservation> getReservations(Long roomId) {
        return reservationRepository.findByRoomId(roomId);
    }

    public RoomReservation reserve(Long roomId, RoomReservationRequest request) {
        if (!roomRepository.existsById(roomId)) {
            throw new EntityNotFoundException("Room not found with id " + roomId);
        }
        if (request.getStartTime() == null || request.getEndTime() == null
                || !request.getEndTime().isAfter(request.getStartTime())) {
            throw new IllegalArgumentException("Invalid time range");
        }
        boolean conflict = reservationRepository.existsByRoomIdAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
                roomId,
                List.of(RoomReservation.Status.RESERVED, RoomReservation.Status.CONFIRMED),
                request.getStartTime(),
                request.getEndTime());
        if (conflict) {
            throw new IllegalArgumentException("Room already reserved for this time range");
        }
        RoomReservation reservation = new RoomReservation();
        reservation.setRoomId(roomId);
        reservation.setStartTime(request.getStartTime());
        reservation.setEndTime(request.getEndTime());
        reservation.setReservedByUserId(request.getReservedByUserId());
        reservation.setPurpose(request.getPurpose());
        reservation.setStatus(RoomReservation.Status.RESERVED);
        return reservationRepository.save(reservation);
    }

    public void cancelReservation(Long roomId, Long reservationId) {
        RoomReservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Reservation not found with id " + reservationId));
        if (!roomId.equals(reservation.getRoomId())) {
            throw new EntityNotFoundException("Reservation not found for room " + roomId);
        }
        reservation.setStatus(RoomReservation.Status.CANCELLED);
        reservationRepository.save(reservation);
    }
}
