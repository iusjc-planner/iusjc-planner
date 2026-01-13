package com.example.iusj_teacher_service.repository;

import com.example.iusj_teacher_service.entities.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    
    /**
     * Récupère un enseignant par son userId
     */
    Optional<Teacher> findByUserId(Long userId);
}

