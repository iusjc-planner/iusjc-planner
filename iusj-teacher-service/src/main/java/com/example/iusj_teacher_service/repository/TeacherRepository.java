package com.example.iusj_teacher_service.repository;

import com.example.iusj_teacher_service.entities.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TeacherRepository extends JpaRepository<Teacher, Long> {
              List<Teacher> findByStatus(Teacher.Status status);

              List<Teacher> findByGrade(Teacher.Grade grade);

              Optional<Teacher> findByUserId(Long userId);

              void deleteByUserId(Long userId);

              boolean existsByUserId(Long userId);

              @Query("""
                                          SELECT t
                                          FROM Teacher t
                                          WHERE (:nom IS NULL OR LOWER(t.nom) LIKE LOWER(CONCAT('%', :nom, '%')))
                                                 AND (:prenom IS NULL OR LOWER(t.prenom) LIKE LOWER(CONCAT('%', :prenom, '%')))
                                                 AND (:specialite IS NULL OR LOWER(t.specialite) LIKE LOWER(CONCAT('%', :specialite, '%')))
                                                 AND (:email IS NULL OR LOWER(t.email) LIKE LOWER(CONCAT('%', :email, '%')))
                                          """)
              List<Teacher> search(@Param("nom") String nom,
                                                                                     @Param("prenom") String prenom,
                                                                                     @Param("specialite") String specialite,
                                                                                     @Param("email") String email);
}
