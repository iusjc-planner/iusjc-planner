package com.example.iusj_student_service.services;

import com.example.iusj_student_service.entities.Student;
import com.example.iusj_student_service.entities.StudentGroup;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;

public class StudentSpecifications {

    public static Specification<Student> withFilters(String matricule, String nom, String prenom,
                                                     String email, Student.Status status, Long groupId) {
        return Specification.where(hasMatricule(matricule))
                .and(hasNom(nom))
                .and(hasPrenom(prenom))
                .and(hasEmail(email))
                .and(hasStatus(status))
                .and(hasGroupId(groupId));
    }

    private static Specification<Student> hasMatricule(String matricule) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(matricule)) return cb.conjunction();
            return cb.equal(cb.lower(root.get("matricule")), matricule.toLowerCase());
        };
    }

    private static Specification<Student> hasNom(String nom) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(nom)) return cb.conjunction();
            String pattern = "%" + nom.toLowerCase() + "%";
            return cb.like(cb.lower(root.get("nom")), pattern);
        };
    }

    private static Specification<Student> hasPrenom(String prenom) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(prenom)) return cb.conjunction();
            String pattern = "%" + prenom.toLowerCase() + "%";
            return cb.like(cb.lower(root.get("prenom")), pattern);
        };
    }

    private static Specification<Student> hasEmail(String email) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(email)) return cb.conjunction();
            String pattern = "%" + email.toLowerCase() + "%";
            return cb.like(cb.lower(root.get("email")), pattern);
        };
    }

    private static Specification<Student> hasStatus(Student.Status status) {
        return (root, query, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    private static Specification<Student> hasGroupId(Long groupId) {
        return (root, query, cb) -> {
            if (groupId == null) return cb.conjunction();
            Join<Student, StudentGroup> join = root.join("groups", JoinType.LEFT);
            query.distinct(true);
            return cb.equal(join.get("groupId"), groupId);
        };
    }
}
