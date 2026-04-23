package com.example.iusj_resource_service.repositories;

import com.example.iusj_resource_service.entities.ResourceReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ResourceReservationRepository extends JpaRepository<ResourceReservation, Long> {

    List<ResourceReservation> findByResourceId(Long resourceId);

    @Query("SELECT r FROM ResourceReservation r WHERE r.resourceId = :resourceId AND r.status IN :statuses")
    List<ResourceReservation> findActiveReservations(
            @Param("resourceId") Long resourceId,
            @Param("statuses") List<ResourceReservation.ReservationStatus> statuses);

    @Query("SELECT r FROM ResourceReservation r WHERE r.resourceId = :resourceId " +
           "AND r.status IN :statuses " +
           "AND r.date = :date " +
           "AND r.heureDebut < :heureFin AND r.heureFin > :heureDebut")
    List<ResourceReservation> findConflictingReservations(
            @Param("resourceId") Long resourceId,
            @Param("statuses") List<ResourceReservation.ReservationStatus> statuses,
            @Param("date") LocalDate date,
            @Param("heureDebut") LocalTime heureDebut,
            @Param("heureFin") LocalTime heureFin);
}
