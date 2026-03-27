package com.example.iusj_schedule_service.services;

import java.time.LocalDateTime;

import com.example.iusj_schedule_service.entities.ScheduleEntry;
import org.springframework.data.jpa.domain.Specification;

public class ScheduleSpecifications {

    public static Specification<ScheduleEntry> withFilters(Long courseId, Long teacherId, Long roomId,
                                                           Long groupId, ScheduleEntry.Status status,
                                                           LocalDateTime startFrom, LocalDateTime endTo) {
        return Specification.where(hasCourse(courseId))
                .and(hasTeacher(teacherId))
                .and(hasRoom(roomId))
                .and(hasGroup(groupId))
                .and(hasStatus(status))
                .and(startsAfter(startFrom))
                .and(endsBefore(endTo));
    }

    private static Specification<ScheduleEntry> hasCourse(Long courseId) {
        return (root, query, cb) -> courseId == null ? cb.conjunction() : cb.equal(root.get("courseId"), courseId);
    }

    private static Specification<ScheduleEntry> hasTeacher(Long teacherId) {
        return (root, query, cb) -> teacherId == null ? cb.conjunction() : cb.equal(root.get("teacherId"), teacherId);
    }

    private static Specification<ScheduleEntry> hasRoom(Long roomId) {
        return (root, query, cb) -> roomId == null ? cb.conjunction() : cb.equal(root.get("roomId"), roomId);
    }

    private static Specification<ScheduleEntry> hasGroup(Long groupId) {
        return (root, query, cb) -> groupId == null ? cb.conjunction() : cb.equal(root.get("groupId"), groupId);
    }

    private static Specification<ScheduleEntry> hasStatus(ScheduleEntry.Status status) {
        return (root, query, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    private static Specification<ScheduleEntry> startsAfter(LocalDateTime startFrom) {
        return (root, query, cb) -> startFrom == null ? cb.conjunction() : cb.greaterThanOrEqualTo(root.get("startTime"), startFrom);
    }

    private static Specification<ScheduleEntry> endsBefore(LocalDateTime endTo) {
        return (root, query, cb) -> endTo == null ? cb.conjunction() : cb.lessThanOrEqualTo(root.get("endTime"), endTo);
    }
}
