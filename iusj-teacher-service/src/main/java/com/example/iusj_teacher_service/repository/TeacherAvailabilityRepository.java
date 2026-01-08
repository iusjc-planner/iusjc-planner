package com.example.iusj_teacher_service.repository;

import com.example.iusj_teacher_service.entities.TeacherAvailability;
import com.example.iusj_teacher_service.entities.TeacherAvailability.AvailabilityStatus;
import com.example.iusj_teacher_service.entities.TeacherAvailability.AvailabilityType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TeacherAvailabilityRepository extends JpaRepository<TeacherAvailability, Long> {

    /**
     * Récupère toutes les disponibilités d'un enseignant
     */
    List<TeacherAvailability> findByTeacherId(Long teacherId);

    /**
     * Récupère les disponibilités récurrentes (hebdomadaires) d'un enseignant
     */
    List<TeacherAvailability> findByTeacherIdAndAvailabilityType(Long teacherId, AvailabilityType availabilityType);

    /**
     * Récupère les disponibilités d'un enseignant pour un jour de la semaine
     */
    List<TeacherAvailability> findByTeacherIdAndDayOfWeek(Long teacherId, Integer dayOfWeek);

    /**
     * Récupère les disponibilités d'un enseignant par statut
     */
    List<TeacherAvailability> findByTeacherIdAndStatus(Long teacherId, AvailabilityStatus status);

    /**
     * Récupère les indisponibilités ponctuelles d'un enseignant pour une date spécifique
     */
    List<TeacherAvailability> findByTeacherIdAndSpecificDate(Long teacherId, LocalDate specificDate);

    /**
     * Récupère les indisponibilités qui chevauchent une période donnée
     */
    @Query("""
        SELECT ta FROM TeacherAvailability ta 
        WHERE ta.teacherId = :teacherId 
        AND ta.availabilityType = 'DATE_RANGE'
        AND ta.specificDate <= :endDate 
        AND ta.endDate >= :startDate
    """)
    List<TeacherAvailability> findOverlappingDateRanges(
        @Param("teacherId") Long teacherId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    /**
     * Vérifie si un événement ICS existe déjà pour éviter les doublons
     */
    Optional<TeacherAvailability> findByTeacherIdAndIcsEventUid(Long teacherId, String icsEventUid);

    /**
     * Supprime toutes les disponibilités importées via ICS pour un enseignant
     */
    @Modifying
    @Query("DELETE FROM TeacherAvailability ta WHERE ta.teacherId = :teacherId AND ta.fromIcsImport = true")
    void deleteIcsImportedByTeacherId(@Param("teacherId") Long teacherId);

    /**
     * Supprime toutes les disponibilités d'un type donné pour un enseignant
     */
    @Modifying
    void deleteByTeacherIdAndAvailabilityType(Long teacherId, AvailabilityType availabilityType);

    /**
     * Récupère les indisponibilités d'un enseignant pour une plage de dates
     */
    @Query("""
        SELECT ta FROM TeacherAvailability ta 
        WHERE ta.teacherId = :teacherId 
        AND ta.status = 'UNAVAILABLE'
        AND (
            (ta.availabilityType = 'SPECIFIC_DATE' AND ta.specificDate BETWEEN :startDate AND :endDate)
            OR (ta.availabilityType = 'DATE_RANGE' AND ta.specificDate <= :endDate AND ta.endDate >= :startDate)
        )
    """)
    List<TeacherAvailability> findUnavailabilitiesInDateRange(
        @Param("teacherId") Long teacherId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
}
