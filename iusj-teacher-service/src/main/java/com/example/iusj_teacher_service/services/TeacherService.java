package com.example.iusj_teacher_service.services;

import com.example.iusj_teacher_service.entities.Teacher;
import com.example.iusj_teacher_service.repository.TeacherRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class TeacherService {

    private final TeacherRepository teacherRepository;

    public TeacherService(TeacherRepository teacherRepository) {
        this.teacherRepository = teacherRepository;
    }

    public List<Teacher> getAll() {
        return teacherRepository.findAll();
    }

    public Optional<Teacher> getById(Long id) {
        return teacherRepository.findById(id);
    }

    public Teacher create(Teacher teacher) {
        return teacherRepository.save(teacher);
    }

    public Optional<Teacher> update(Long id, Teacher payload) {
        return teacherRepository.findById(id).map(existing -> {
            existing.setNom(payload.getNom());
            existing.setPrenom(payload.getPrenom());
            existing.setEmail(payload.getEmail());
            existing.setTelephone(payload.getTelephone());
            existing.setSpecialite(payload.getSpecialite());
            existing.setGrade(payload.getGrade());
            existing.setStatus(payload.getStatus());
            return teacherRepository.save(existing);
        });
    }

    public void delete(Long id) {
        teacherRepository.deleteById(id);
    }

    public List<Teacher> findByStatus(Teacher.Status status) {
        return teacherRepository.findByStatus(status);
    }

    public List<Teacher> findByGrade(Teacher.Grade grade) {
        return teacherRepository.findByGrade(grade);
    }

    public List<Teacher> search(String nom, String prenom, String specialite, String email) {
        return teacherRepository.search(emptyToNull(nom), emptyToNull(prenom), emptyToNull(specialite), emptyToNull(email));
    }

    private String emptyToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
