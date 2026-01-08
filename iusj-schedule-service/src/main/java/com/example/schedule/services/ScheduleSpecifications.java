package com.example.schedule.services;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import com.example.schedule.entities.ScheduleEntry;
import com.example.schedule.entities.SessionStatus;

import jakarta.persistence.criteria.Predicate;

public final class ScheduleSpecifications {

    private ScheduleSpecifications() {}

    public static Specification<ScheduleEntry> filter(
        String courseId,
        String teacherId,
        String roomId,
        String groupId,
        SessionStatus status,
        LocalDateTime startFrom,
        LocalDateTime endTo
    ) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(courseId)) {
                predicates.add(builder.equal(root.get("courseId"), courseId));
            }
            if (StringUtils.hasText(teacherId)) {
                predicates.add(builder.equal(root.get("teacherId"), teacherId));
            }
            if (StringUtils.hasText(roomId)) {
                predicates.add(builder.equal(root.get("roomId"), roomId));
            }
            if (StringUtils.hasText(groupId)) {
                predicates.add(builder.equal(root.get("groupId"), groupId));
            }
            if (status != null) {
                predicates.add(builder.equal(root.get("status"), status));
            }
            if (startFrom != null) {
                predicates.add(builder.greaterThanOrEqualTo(root.get("startTime"), startFrom));
            }
            if (endTo != null) {
                predicates.add(builder.lessThanOrEqualTo(root.get("endTime"), endTo));
            }

            return builder.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<ScheduleEntry> overlapFor(String fieldName,
                                                          String fieldValue,
                                                          LocalDateTime start,
                                                          LocalDateTime end,
                                                          Long excludeId) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (fieldValue == null || fieldValue.isBlank() || start == null || end == null) {
                return builder.disjunction();
            }
            predicates.add(builder.equal(root.get(fieldName), fieldValue));
            predicates.add(builder.lessThan(root.get("startTime"), end));
            predicates.add(builder.greaterThan(root.get("endTime"), start));
            if (excludeId != null) {
                predicates.add(builder.notEqual(root.get("id"), excludeId));
            }
            return builder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
