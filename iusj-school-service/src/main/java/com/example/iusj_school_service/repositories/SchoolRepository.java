package com.example.iusj_school_service.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.example.iusj_school_service.entities.School;

public interface SchoolRepository extends JpaRepository<School, Long>, JpaSpecificationExecutor<School> {

	long countByStatus(School.Status status);
}
