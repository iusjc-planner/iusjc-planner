package com.example.iusj_teacher_service.repository;

import com.example.iusj_teacher_service.entities.Disponibilite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface DisponibiliteRepository extends JpaRepository<Disponibilite, Long> {

    /**
     * Récupère toutes les disponibilités d'un utilisateur
     */
    List<Disponibilite> findByUserId(Long userId);

    /**
     * Récupère les disponibilités d'un utilisateur pour une date spécifique
     */
    List<Disponibilite> findByUserIdAndDate(Long userId, LocalDate date);

    /**
     * Récupère les disponibilités d'un utilisateur entre deux dates
     */
    @Query("SELECT d FROM Disponibilite d WHERE d.userId = :userId AND d.date BETWEEN :startDate AND :endDate ORDER BY d.date, d.heureDebut")
    List<Disponibilite> findByUserIdAndDateRange(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    /**
     * Supprime toutes les disponibilités d'un utilisateur
     */
    void deleteByUserId(Long userId);

    /**
     * Récupère les disponibilités disponibles d'un utilisateur
     */
    @Query("SELECT d FROM Disponibilite d WHERE d.userId = :userId AND d.isAvailable = true ORDER BY d.date, d.heureDebut")
    List<Disponibilite> findAvailableByUserId(@Param("userId") Long userId);

    /**
     * Récupère les disponibilités disponibles d'un utilisateur pour une date
     */
    @Query("SELECT d FROM Disponibilite d WHERE d.userId = :userId AND d.date = :date AND d.isAvailable = true ORDER BY d.heureDebut")
    List<Disponibilite> findAvailableByUserIdAndDate(@Param("userId") Long userId, @Param("date") LocalDate date);
}
