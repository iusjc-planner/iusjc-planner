package com.example.iusj_room_service.services;

import com.example.iusj_room_service.entities.Room;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public class RoomSpecifications {

    public static Specification<Room> withFilters(String name, Room.RoomType type, Room.RoomStatus status, Integer minCapacity, Long equipmentId) {
        return Specification.where(hasName(name))
                .and(hasType(type))
                .and(hasStatus(status))
                .and(hasMinCapacity(minCapacity))
                .and(hasEquipmentId(equipmentId));
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

    private static Specification<Room> hasEquipmentId(Long equipmentId) {
        return (root, query, cb) -> {
            if (equipmentId == null) {
                return cb.conjunction();
            }
            query.distinct(true);
            return cb.equal(root.join("equipments").get("resourceId"), equipmentId);
        };
    }
}
