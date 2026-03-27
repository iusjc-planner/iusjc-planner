package com.example.iusj_event_service.repositories;

import com.example.iusj_event_service.entities.Evenement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface EvenementRepository extends JpaRepository<Evenement, Long>, JpaSpecificationExecutor<Evenement> {

    List<Evenement> findByDate(LocalDate date);

    List<Evenement> findByDateBetween(LocalDate start, LocalDate end);

    List<Evenement> findBySalleId(Long salleId);

    List<Evenement> findByType(Evenement.EventType type);

    List<Evenement> findBySalleIdAndDate(Long salleId, LocalDate date);

    boolean existsBySalleIdAndDateAndHeureDebutBetween(Long salleId, LocalDate date, LocalTime start, LocalTime end);
}
