package com.example.iusj_teacher_service.services;

import com.example.iusj_teacher_service.entities.Disponibilite;
import com.example.iusj_teacher_service.entities.Teacher;
import com.example.iusj_teacher_service.repository.DisponibiliteRepository;
import com.example.iusj_teacher_service.repository.TeacherRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

/**
 * Service pour gérer les disponibilités des enseignants
 */
@Service
@Transactional
public class DisponibiliteService {

    private final DisponibiliteRepository disponibiliteRepository;
    private final TeacherRepository teacherRepository;

    public DisponibiliteService(DisponibiliteRepository disponibiliteRepository, 
                                TeacherRepository teacherRepository) {
        this.disponibiliteRepository = disponibiliteRepository;
        this.teacherRepository = teacherRepository;
    }

    /**
     * Récupère toutes les disponibilités d'un utilisateur
     */
    public List<Disponibilite> getByTeacherId(Long userId) {
        return disponibiliteRepository.findByUserId(userId);
    }

    /**
     * Récupère les disponibilités disponibles d'un utilisateur
     */
    public List<Disponibilite> getAvailableByTeacherId(Long userId) {
        return disponibiliteRepository.findAvailableByUserId(userId);
    }

    /**
     * Récupère les disponibilités d'un utilisateur pour une date spécifique
     */
    public List<Disponibilite> getByTeacherIdAndDate(Long userId, LocalDate date) {
        return disponibiliteRepository.findByUserIdAndDate(userId, date);
    }

    /**
     * Récupère les disponibilités disponibles d'un utilisateur pour une date
     */
    public List<Disponibilite> getAvailableByTeacherIdAndDate(Long userId, LocalDate date) {
        return disponibiliteRepository.findAvailableByUserIdAndDate(userId, date);
    }

    /**
     * Récupère les disponibilités d'un utilisateur entre deux dates
     */
    public List<Disponibilite> getByTeacherIdAndDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        return disponibiliteRepository.findByUserIdAndDateRange(userId, startDate, endDate);
    }

    /**
     * Crée une nouvelle disponibilité
     */
    public Disponibilite create(Long userId, Disponibilite disponibilite) {
        disponibilite.setUserId(userId);
        return disponibiliteRepository.save(disponibilite);
    }

    /**
     * Crée plusieurs disponibilités à la fois
     */
    public List<Disponibilite> createMultiple(Long userId, List<Disponibilite> disponibilites) {
        for (Disponibilite d : disponibilites) {
            d.setUserId(userId);
        }
        return disponibiliteRepository.saveAll(disponibilites);
    }

    /**
     * Met à jour une disponibilité
     */
    public Optional<Disponibilite> update(Long id, Disponibilite disponibilite) {
        return disponibiliteRepository.findById(id).map(existing -> {
            existing.setDate(disponibilite.getDate());
            existing.setHeureDebut(disponibilite.getHeureDebut());
            existing.setDuree(disponibilite.getDuree());
            existing.setIsAvailable(disponibilite.getIsAvailable());
            existing.setReason(disponibilite.getReason());
            return disponibiliteRepository.save(existing);
        });
    }

    /**
     * Supprime une disponibilité
     */
    public void delete(Long id) {
        disponibiliteRepository.deleteById(id);
    }

    /**
     * Remplace toutes les disponibilités d'un utilisateur
     */
    public List<Disponibilite> replaceAll(Long userId, List<Disponibilite> disponibilites) {
        // Supprimer les anciennes disponibilités
        disponibiliteRepository.deleteByUserId(userId);
        
        // Ajouter les nouvelles
        for (Disponibilite d : disponibilites) {
            d.setUserId(userId);
        }
        
        return disponibiliteRepository.saveAll(disponibilites);
    }
}
