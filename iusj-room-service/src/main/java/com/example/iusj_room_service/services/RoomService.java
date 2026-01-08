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

import com.example.iusj_room_service.entities.Room;
import com.example.iusj_room_service.repositories.RoomRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
@Transactional
public class RoomService {

    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
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
        // En attendant l'intégration du service de planning, on renvoie les salles actives filtrées
        List<String> eq = CollectionUtils.isEmpty(equipments) ? Collections.emptyList() : equipments;
        Specification<Room> spec = RoomSpecifications.withFilters(null, null, Room.RoomStatus.ACTIVE, minCapacity, eq);
        return roomRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "name"));
    }
}
