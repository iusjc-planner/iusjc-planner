package com.example.iusj_report_service.repositories;

import com.example.iusj_report_service.entities.Rapport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface RapportRepository extends JpaRepository<Rapport, Long> {

    List<Rapport> findByType(Rapport.ReportType type);

    List<Rapport> findByGenerePar(Long userId);

    List<Rapport> findByDateGenerationBetween(LocalDateTime start, LocalDateTime end);
}
