package com.example.iusj_group_service.services;

import com.example.iusj_group_service.entities.Group;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public class GroupSpecifications {

    public static Specification<Group> withFilters(String name, String level, Long schoolId, Group.Status status) {
        return Specification.where(hasName(name))
                .and(hasLevel(level))
                .and(hasSchool(schoolId))
                .and(hasStatus(status));
    }

    private static Specification<Group> hasName(String name) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(name)) return cb.conjunction();
            String pattern = "%" + name.toLowerCase() + "%";
            return cb.like(cb.lower(root.get("name")), pattern);
        };
    }

    private static Specification<Group> hasLevel(String level) {
        return (root, query, cb) -> !StringUtils.hasText(level) ? cb.conjunction() : cb.equal(root.get("level"), level);
    }

    private static Specification<Group> hasSchool(Long schoolId) {
        return (root, query, cb) -> schoolId == null ? cb.conjunction() : cb.equal(root.get("schoolId"), schoolId);
    }

    private static Specification<Group> hasStatus(Group.Status status) {
        return (root, query, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }
}
