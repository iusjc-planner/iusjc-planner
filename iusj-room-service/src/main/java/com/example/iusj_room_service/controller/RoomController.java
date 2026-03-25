package com.example.iusj_room_service.controller;

import java.time.LocalDateTime;
import java.util.List;

import com.example.iusj_room_service.dto.RoomEquipmentRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.iusj_room_service.dto.RoomReservationRequest;
import com.example.iusj_room_service.entities.Room;
import com.example.iusj_room_service.entities.RoomEquipment;
import com.example.iusj_room_service.entities.RoomReservation;
import com.example.iusj_room_service.services.RoomService;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping
    public List<Room> listRooms(@RequestParam(required = false) String name,
                                @RequestParam(required = false) Room.RoomType type,
                                @RequestParam(required = false) Room.RoomStatus status,
                                @RequestParam(required = false) Integer minCapacity,
                                @RequestParam(required = false) Long equipmentId) {
        return roomService.getAll(name, type, status, minCapacity, equipmentId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoom(@PathVariable Long id) {
        return roomService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Room> createRoom(@Valid @RequestBody Room room) {
        return ResponseEntity.ok(roomService.create(room));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Room> updateRoom(@PathVariable Long id, @Valid @RequestBody Room room) {
        return roomService.update(id, room)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        roomService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/available")
    public List<Room> availableRooms(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
                                     @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
                                     @RequestParam(required = false) Integer minCapacity,
                                     @RequestParam(required = false) Long equipmentId) {
        return roomService.findAvailable(start, end, minCapacity, equipmentId);
    }

    @GetMapping("/{id}/equipments")
    public List<RoomEquipment> listRoomEquipments(@PathVariable Long id) {
        return roomService.getEquipments(id);
    }

    @PostMapping("/{id}/equipments")
    public ResponseEntity<RoomEquipment> addEquipment(@PathVariable Long id, @Valid @RequestBody RoomEquipmentRequest request) {
        return ResponseEntity.status(201).body(roomService.addEquipment(id, request.getResourceId(), request.getQuantite()));
    }

    @PutMapping("/{id}/equipments/{resourceId}")
    public ResponseEntity<RoomEquipment> updateEquipmentQuantity(
            @PathVariable Long id,
            @PathVariable Long resourceId,
            @Valid @RequestBody RoomEquipmentRequest request) {
        return ResponseEntity.ok(roomService.updateEquipmentQuantity(id, resourceId, request.getQuantite()));
    }

    @DeleteMapping("/{id}/equipments/{resourceId}")
    public ResponseEntity<Void> removeEquipment(@PathVariable Long id, @PathVariable Long resourceId) {
        roomService.removeEquipment(id, resourceId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/with-equipment/{resourceId}")
    public List<Room> getRoomsByEquipment(@PathVariable Long resourceId) {
        return roomService.getRoomsByEquipment(resourceId);
    }

    @GetMapping("/{id}/reservations")
    public List<RoomReservation> listReservations(@PathVariable Long id) {
        return roomService.getReservations(id);
    }

    @PostMapping("/{id}/reserve")
    public ResponseEntity<?> reserve(@PathVariable Long id, @Valid @RequestBody RoomReservationRequest request) {
        try {
            RoomReservation reservation = roomService.reserve(id, request);
            return ResponseEntity.status(201).body(reservation);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(409).body(ex.getMessage());
        }
    }

    @DeleteMapping("/{id}/reservations/{reservationId}")
    public ResponseEntity<Void> cancelReservation(@PathVariable Long id, @PathVariable Long reservationId) {
        roomService.cancelReservation(id, reservationId);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<String> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(404).body(ex.getMessage());
    }
}
