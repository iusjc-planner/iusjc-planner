package com.example.iusj_course_service.services;

import java.time.LocalDate;

import com.example.iusj_course_service.entities.Course;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public class CourseSpecifications {

    public static Specification<Course> withFilters(Long matiereId, Course.CourseStatus status, Course.CourseType type,
                                                     Long teacherId, Long roomId, Long groupId, 
                                                     LocalDate dateFrom, LocalDate dateTo) {
        return Specification.where(hasMatiere(matiereId))
                .and(hasStatus(status))
                .and(hasType(type))
                .and(hasTeacher(teacherId))
                .and(hasRoom(roomId))
                .and(hasGroup(groupId))
                .and(hasDateRange(dateFrom, dateTo));
    }

    private static Specification<Course> hasMatiere(Long matiereId) {
        return (root, query, cb) -> matiereId == null ? cb.conjunction() : cb.equal(root.get("matiereId"), matiereId);
    }

    private static Specification<Course> hasStatus(Course.CourseStatus status) {
        return (root, query, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    private static Specification<Course> hasType(Course.CourseType type) {
        return (root, query, cb) -> type == null ? cb.conjunction() : cb.equal(root.get("type"), type);
    }

    private static Specification<Course> hasTeacher(Long teacherId) {
        return (root, query, cb) -> teacherId == null ? cb.conjunction() : cb.equal(root.get("teacherId"), teacherId);
    }

    private static Specification<Course> hasRoom(Long roomId) {
        return (root, query, cb) -> roomId == null ? cb.conjunction() : cb.equal(root.get("roomId"), roomId);
    }

    private static Specification<Course> hasGroup(Long groupId) {
        return (root, query, cb) -> groupId == null ? cb.conjunction() : cb.equal(root.get("groupId"), groupId);
    }

    private static Specification<Course> hasDateRange(LocalDate dateFrom, LocalDate dateTo) {
        return (root, query, cb) -> {
            if (dateFrom == null && dateTo == null) {
                return cb.conjunction();
            }
            if (dateFrom != null && dateTo != null) {
                return cb.between(root.get("date"), dateFrom, dateTo);
            }
            if (dateFrom != null) {
                return cb.greaterThanOrEqualTo(root.get("date"), dateFrom);
            }
            return cb.lessThanOrEqualTo(root.get("date"), dateTo);
        };
    }
}

