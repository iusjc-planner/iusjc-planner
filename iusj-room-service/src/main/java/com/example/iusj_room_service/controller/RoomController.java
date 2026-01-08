package com.example.iusj_room_service.controller;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
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

import com.example.iusj_room_service.entities.Room;
import com.example.iusj_room_service.services.RoomService;

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
                                @RequestParam(required = false) String equipments) {
        List<String> equipmentsList = equipments != null && !equipments.isEmpty()
                ? Arrays.asList(equipments.split(","))
                : Collections.emptyList();
        return roomService.getAll(name, type, status, minCapacity, equipmentsList);
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
                                     @RequestParam(required = false) String equipments) {
        List<String> equipmentsList = equipments != null && !equipments.isEmpty()
                ? Arrays.asList(equipments.split(","))
                : Collections.emptyList();
        return roomService.findAvailable(start, end, minCapacity, equipmentsList);
    }
}
