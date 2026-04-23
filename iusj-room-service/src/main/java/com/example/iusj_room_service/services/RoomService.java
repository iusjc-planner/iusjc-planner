package com.example.iusj_room_service.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.iusj_room_service.dto.RoomReservationRequest;
import com.example.iusj_room_service.entities.Room;
import com.example.iusj_room_service.entities.RoomEquipment;
import com.example.iusj_room_service.entities.RoomReservation;
import com.example.iusj_room_service.repositories.RoomEquipmentRepository;
import com.example.iusj_room_service.repositories.RoomRepository;
import com.example.iusj_room_service.repositories.RoomReservationRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
@Transactional
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomEquipmentRepository roomEquipmentRepository;
    private final RoomReservationRepository reservationRepository;

    public RoomService(
            RoomRepository roomRepository,
            RoomEquipmentRepository roomEquipmentRepository,
            RoomReservationRepository reservationRepository) {
        this.roomRepository = roomRepository;
        this.roomEquipmentRepository = roomEquipmentRepository;
        this.reservationRepository = reservationRepository;
    }

    public List<Room> getAll(String name, Room.RoomType type, Room.RoomStatus status, Integer minCapacity, Long equipmentId) {
        Specification<Room> spec = RoomSpecifications.withFilters(name, type, status, minCapacity, equipmentId);
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

    public List<Room> findAvailable(LocalDateTime start, LocalDateTime end, Integer minCapacity, Long equipmentId) {
        Specification<Room> spec = RoomSpecifications.withFilters(null, null, Room.RoomStatus.ACTIVE, minCapacity, equipmentId);
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

    public List<RoomEquipment> getEquipments(Long roomId) {
        if (!roomRepository.existsById(roomId)) {
            throw new EntityNotFoundException("Room not found with id " + roomId);
        }
        return roomEquipmentRepository.findByRoomId(roomId);
    }

    public RoomEquipment addEquipment(Long roomId, Long resourceId, Integer quantite) {
        if (!roomRepository.existsById(roomId)) {
            throw new EntityNotFoundException("Room not found with id " + roomId);
        }
        if (resourceId == null) {
            throw new IllegalArgumentException("resourceId is required");
        }
        int quantity = quantite == null ? 1 : quantite;
        if (quantity < 1) {
            throw new IllegalArgumentException("quantite must be >= 1");
        }

        RoomEquipment equipment = roomEquipmentRepository.findByRoomIdAndResourceId(roomId, resourceId)
            .orElseGet(RoomEquipment::new);
        equipment.setRoomId(roomId);
        equipment.setResourceId(resourceId);
        equipment.setQuantite(quantity);
        return roomEquipmentRepository.save(equipment);
    }

    public RoomEquipment updateEquipmentQuantity(Long roomId, Long resourceId, Integer quantite) {
        if (quantite == null || quantite < 1) {
            throw new IllegalArgumentException("quantite must be >= 1");
        }
        RoomEquipment equipment = roomEquipmentRepository.findByRoomIdAndResourceId(roomId, resourceId)
            .orElseThrow(() -> new EntityNotFoundException("Equipment not found for room " + roomId));
        equipment.setQuantite(quantite);
        return roomEquipmentRepository.save(equipment);
    }

    public void removeEquipment(Long roomId, Long resourceId) {
        RoomEquipment equipment = roomEquipmentRepository.findByRoomIdAndResourceId(roomId, resourceId)
            .orElseThrow(() -> new EntityNotFoundException("Equipment not found for room " + roomId));
        roomEquipmentRepository.delete(equipment);
    }

    public List<Room> getRoomsByEquipment(Long resourceId) {
        if (resourceId == null) {
            throw new IllegalArgumentException("resourceId is required");
        }
        return roomRepository.findAll(
            RoomSpecifications.withFilters(null, null, null, null, resourceId),
            Sort.by(Sort.Direction.ASC, "name")
        );
    }

    public RoomReservation reserve(Long roomId, RoomReservationRequest request) {
        if (!roomRepository.existsById(roomId)) {
            throw new EntityNotFoundException("Room not found with id " + roomId);
        }
        if (request.getStartTime() == null || request.getEndTime() == null
                || !request.getEndTime().isAfter(request.getStartTime())) {
            throw new IllegalArgumentException("Invalid time range");
        }
        boolean conflict = reservationRepository.existsConflict(
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
