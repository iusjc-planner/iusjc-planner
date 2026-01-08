package com.example.iusj_room_service.services;

import com.example.iusj_room_service.entities.Room;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import jakarta.persistence.criteria.Predicate;

import java.util.List;

public class RoomSpecifications {

    public static Specification<Room> withFilters(String name, Room.RoomType type, Room.RoomStatus status, Integer minCapacity, List<String> equipments) {
        return Specification.where(hasName(name))
                .and(hasType(type))
                .and(hasStatus(status))
                .and(hasMinCapacity(minCapacity))
                .and(hasEquipments(equipments));
    }

    private static Specification<Room> hasName(String name) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(name)) {
                return cb.conjunction();
            }
            String pattern = "%" + name.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), pattern),
                    cb.like(cb.lower(root.get("location")), pattern)
            );
        };
    }

    private static Specification<Room> hasType(Room.RoomType type) {
        return (root, query, cb) -> type == null ? cb.conjunction() : cb.equal(root.get("type"), type);
    }

    private static Specification<Room> hasStatus(Room.RoomStatus status) {
        return (root, query, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    private static Specification<Room> hasMinCapacity(Integer minCapacity) {
        return (root, query, cb) -> minCapacity == null ? cb.conjunction() : cb.greaterThanOrEqualTo(root.get("capacity"), minCapacity);
    }

    private static Specification<Room> hasEquipments(List<String> equipments) {
        return (root, query, cb) -> {
            if (CollectionUtils.isEmpty(equipments)) {
                return cb.conjunction();
            }
            return cb.and(equipments.stream()
                    .map(eq -> cb.isMember(eq, root.get("equipments")))
                    .toArray(Predicate[]::new));
        };
    }
}
