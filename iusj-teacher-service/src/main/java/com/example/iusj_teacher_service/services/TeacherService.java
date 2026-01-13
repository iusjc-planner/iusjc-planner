package com.example.iusj_teacher_service.services;

import com.example.iusj_teacher_service.entities.Teacher;
import com.example.iusj_teacher_service.repository.TeacherRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Service pour gérer les enseignants
 */
@Service
@Transactional
public class TeacherService {

    private final TeacherRepository teacherRepository;

    public TeacherService(TeacherRepository teacherRepository) {
        this.teacherRepository = teacherRepository;
    }

    /**
     * Récupère tous les enseignants
     */
    public List<Teacher> getAll() {
        return teacherRepository.findAll();
    }

    /**
     * Récupère un enseignant par son ID
     */
    public Optional<Teacher> getById(Long id) {
        return teacherRepository.findById(id);
    }

    /**
     * Récupère un enseignant par son userId
     */
    public Optional<Teacher> getByUserId(Long userId) {
        return teacherRepository.findByUserId(userId);
    }

    /**
     * Crée un nouvel enseignant
     */
    public Teacher create(Long userId, Set<String> specialities) {
        // Vérifier que l'enseignant n'existe pas déjà pour cet userId
        if (teacherRepository.findByUserId(userId).isPresent()) {
            throw new IllegalArgumentException("Un profil enseignant existe déjà pour cet utilisateur");
        }
        
        Teacher teacher = new Teacher();
        teacher.setUserId(userId);
        teacher.setSpecialities(specialities != null ? specialities : Set.of());
        
        return teacherRepository.save(teacher);
    }

    /**
     * Met à jour un enseignant
     */
    public Optional<Teacher> update(Long id, Set<String> specialities) {
        return teacherRepository.findById(id).map(existing -> {
            if (specialities != null) {
                existing.setSpecialities(specialities);
            }
            return teacherRepository.save(existing);
        });
    }

    /**
     * Supprime un enseignant
     */
    public void delete(Long id) {
        teacherRepository.deleteById(id);
    }

    /**
     * Ajoute une spécialité à un enseignant
     */
    public Optional<Teacher> addSpeciality(Long id, String speciality) {
        return teacherRepository.findById(id).map(existing -> {
            existing.getSpecialities().add(speciality);
            return teacherRepository.save(existing);
        });
    }

    /**
     * Supprime une spécialité d'un enseignant
     */
    public Optional<Teacher> removeSpeciality(Long id, String speciality) {
        return teacherRepository.findById(id).map(existing -> {
            existing.getSpecialities().remove(speciality);
            return teacherRepository.save(existing);
        });
    }
}

