package com.example.iusj_school_service.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.iusj_school_service.entities.Filiere;

public interface FiliereRepository extends JpaRepository<Filiere, Long> {

    List<Filiere> findBySchoolId(Long schoolId);

    List<Filiere> findByStatus(Filiere.Status status);

    boolean existsByCode(String code);
}
