package com.example.iusj_course_service.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.example.iusj_course_service.entities.Matiere;

public interface MatiereRepository extends JpaRepository<Matiere, Long>, JpaSpecificationExecutor<Matiere> {

    Optional<Matiere> findByCode(String code);

    List<Matiere> findBySchoolId(Long schoolId);

    List<Matiere> findByFiliereId(Long filiereId);

    List<Matiere> findByTeacherId(Long teacherId);

    List<Matiere> findByStatus(Matiere.MatiereStatus status);

    boolean existsByCode(String code);

    long countByStatus(Matiere.MatiereStatus status);
}
