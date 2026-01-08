package com.example.iusj_school_service.services;

import com.example.iusj_school_service.entities.School;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public class SchoolSpecifications {

    public static Specification<School> withFilters(String name, School.Status status) {
        return Specification.where(hasName(name)).and(hasStatus(status));
    }

    private static Specification<School> hasName(String name) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(name)) return cb.conjunction();
            String pattern = "%" + name.toLowerCase() + "%";
            return cb.like(cb.lower(root.get("name")), pattern);
        };
    }

    private static Specification<School> hasStatus(School.Status status) {
        return (root, query, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }
}
