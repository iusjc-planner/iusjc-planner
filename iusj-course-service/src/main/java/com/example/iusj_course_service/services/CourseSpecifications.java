package com.example.iusj_course_service.services;

import com.example.iusj_course_service.entities.Course;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public class CourseSpecifications {

    public static Specification<Course> withFilters(String code, String title, Course.CourseStatus status, Long teacherId, Long roomId) {
        return Specification.where(hasCodeOrTitle(code, title))
                .and(hasStatus(status))
                .and(hasTeacher(teacherId))
                .and(hasRoom(roomId));
    }

    private static Specification<Course> hasCodeOrTitle(String code, String title) {
        return (root, query, cb) -> {
            boolean hasCode = StringUtils.hasText(code);
            boolean hasTitle = StringUtils.hasText(title);
            if (!hasCode && !hasTitle) {
                return cb.conjunction();
            }
            String codePattern = hasCode ? "%" + code.toLowerCase() + "%" : null;
            String titlePattern = hasTitle ? "%" + title.toLowerCase() + "%" : null;
            return cb.or(
                    hasCode ? cb.like(cb.lower(root.get("code")), codePattern) : cb.disjunction(),
                    hasTitle ? cb.like(cb.lower(root.get("title")), titlePattern) : cb.disjunction()
            );
        };
    }

    private static Specification<Course> hasStatus(Course.CourseStatus status) {
        return (root, query, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    private static Specification<Course> hasTeacher(Long teacherId) {
        return (root, query, cb) -> teacherId == null ? cb.conjunction() : cb.equal(root.get("teacherId"), teacherId);
    }

    private static Specification<Course> hasRoom(Long roomId) {
        return (root, query, cb) -> roomId == null ? cb.conjunction() : cb.equal(root.get("roomId"), roomId);
    }
}
