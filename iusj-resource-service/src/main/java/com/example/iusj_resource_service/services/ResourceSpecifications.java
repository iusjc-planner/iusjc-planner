package com.example.iusj_resource_service.services;

import com.example.iusj_resource_service.entities.Resource;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public class ResourceSpecifications {

    public static Specification<Resource> withFilters(String nom, Resource.TypeRessource type, Resource.StatutRessource statut) {
        return Specification.where(hasNom(nom))
                .and(hasType(type))
                .and(hasStatut(statut));
    }

    private static Specification<Resource> hasNom(String nom) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(nom)) return cb.conjunction();
            return cb.like(cb.lower(root.get("nom")), "%" + nom.toLowerCase() + "%");
        };
    }

    private static Specification<Resource> hasType(Resource.TypeRessource type) {
        return (root, query, cb) -> type == null ? cb.conjunction() : cb.equal(root.get("type"), type);
    }

    private static Specification<Resource> hasStatut(Resource.StatutRessource statut) {
        return (root, query, cb) -> statut == null ? cb.conjunction() : cb.equal(root.get("statut"), statut);
    }
}
