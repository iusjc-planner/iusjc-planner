package com.example.iusj_course_service.repositories;

import com.example.iusj_course_service.entities.Support;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupportRepository extends JpaRepository<Support, Long> {

    List<Support> findByMatiereId(Long matiereId);

    List<Support> findByMatiereIdAndType(Long matiereId, Support.SupportType type);

    long countByMatiereId(Long matiereId);

    void deleteByMatiereId(Long matiereId);
}
