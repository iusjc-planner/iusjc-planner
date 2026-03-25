package com.example.iusj_event_service.services;

import com.example.iusj_event_service.entities.Evenement;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public class EvenementSpecifications {

    public static Specification<Evenement> withFilters(
            LocalDate date,
            LocalDate from,
            LocalDate to,
            Evenement.EventType type,
            Long salleId,
            Evenement.EventStatus status,
            Long organisateurId) {
        return Specification.where(hasDate(date))
            .and(hasDateRange(from, to))
            .and(hasType(type))
            .and(hasSalle(salleId))
            .and(hasStatus(status))
            .and(hasOrganisateur(organisateurId));
    }

    private static Specification<Evenement> hasDate(LocalDate date) {
        return (root, query, cb) -> date == null ? cb.conjunction() : cb.equal(root.get("date"), date);
    }

    private static Specification<Evenement> hasDateRange(LocalDate from, LocalDate to) {
        return (root, query, cb) -> {
            if (from == null && to == null) {
                return cb.conjunction();
            }
            if (from != null && to != null) {
                return cb.between(root.get("date"), from, to);
            }
            if (from != null) {
                return cb.greaterThanOrEqualTo(root.get("date"), from);
            }
            return cb.lessThanOrEqualTo(root.get("date"), to);
        };
    }

    private static Specification<Evenement> hasType(Evenement.EventType type) {
        return (root, query, cb) -> type == null ? cb.conjunction() : cb.equal(root.get("type"), type);
    }

    private static Specification<Evenement> hasSalle(Long salleId) {
        return (root, query, cb) -> salleId == null ? cb.conjunction() : cb.equal(root.get("salleId"), salleId);
    }

    private static Specification<Evenement> hasStatus(Evenement.EventStatus status) {
        return (root, query, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    private static Specification<Evenement> hasOrganisateur(Long organisateurId) {
        return (root, query, cb) -> organisateurId == null ? cb.conjunction() : cb.equal(root.get("organisateurId"), organisateurId);
    }
}
