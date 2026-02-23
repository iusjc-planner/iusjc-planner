package com.example.iusj_resource_service.services;

import com.example.iusj_resource_service.entities.Resource;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public class ResourceSpecifications {

    public static Specification<Resource> withFilters(String name, String type, Resource.Status status) {
        return Specification.where(hasName(name))
                .and(hasType(type))
                .and(hasStatus(status));
    }

    private static Specification<Resource> hasName(String name) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(name)) return cb.conjunction();
            String pattern = "%" + name.toLowerCase() + "%";
            return cb.like(cb.lower(root.get("name")), pattern);
        };
    }

    private static Specification<Resource> hasType(String type) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(type)) return cb.conjunction();
            String pattern = "%" + type.toLowerCase() + "%";
            return cb.like(cb.lower(root.get("type")), pattern);
        };
    }

    private static Specification<Resource> hasStatus(Resource.Status status) {
        return (root, query, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }
}
