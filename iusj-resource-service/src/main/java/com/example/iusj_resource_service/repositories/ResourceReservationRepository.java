package com.example.iusj_resource_service.repositories;

import com.example.iusj_resource_service.entities.ResourceReservation;
import com.example.iusj_resource_service.entities.ResourceReservation.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ResourceReservationRepository extends JpaRepository<ResourceReservation, Long> {

    /**
     * Find all reservations for a specific resource
     */
    List<ResourceReservation> findByResourceId(Long resourceId);

    /**
     * Find all reservations made by a user
     */
    List<ResourceReservation> findByReservePar(Long userId);

    /**
     * Find reservations for a specific resource on a specific date
     */
    List<ResourceReservation> findByResourceIdAndDate(Long resourceId, LocalDate date);

    /**
     * Find active reservations (PENDING or CONFIRMED) for a resource
     */
    @Query("SELECT r FROM ResourceReservation r WHERE r.resource.id = :resourceId AND r.status IN :statuses")
    List<ResourceReservation> findActiveReservations(
            @Param("resourceId") Long resourceId,
            @Param("statuses") List<ReservationStatus> statuses
    );

    /**
     * Find reservations that overlap with a given time slot
     */
    @Query(value = """
            SELECT r FROM ResourceReservation r 
            WHERE r.resource.id = :resourceId 
            AND r.date = :date 
            AND r.status IN :statuses
            AND NOT (
                FUNCTION('ADDTIME', r.heureDebut, FUNCTION('SEC_TO_TIME', r.duree * 60)) <= :startTime 
                OR r.heureDebut >= :endTime
            )
            """, nativeQuery = false)
    List<ResourceReservation> findConflictingReservations(
            @Param("resourceId") Long resourceId,
            @Param("date") LocalDate date,
            @Param("startTime") java.time.LocalTime startTime,
            @Param("endTime") java.time.LocalTime endTime,
            @Param("statuses") List<ReservationStatus> statuses
    );

    /**
     * Find reservations within a date range
     */
    List<ResourceReservation> findByDateBetweenAndStatus(LocalDate startDate, LocalDate endDate, ReservationStatus status);

    /**
     * Count active reservations for a resource at a specific moment
     */
    @Query("""
            SELECT COUNT(r) FROM ResourceReservation r 
            WHERE r.resource.id = :resourceId 
            AND r.status IN :statuses
            AND r.date = :date 
            AND r.heureDebut <= :time 
            AND FUNCTION('ADDTIME', r.heureDebut, FUNCTION('SEC_TO_TIME', r.duree * 60)) > :time
            """)
    long countActiveReservationsAtTime(
            @Param("resourceId") Long resourceId,
            @Param("date") LocalDate date,
            @Param("time") java.time.LocalTime time,
            @Param("statuses") List<ReservationStatus> statuses
    );
}
