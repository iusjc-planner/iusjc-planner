package com.example.iusj_school_service.services;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.iusj_school_service.entities.Filiere;
import com.example.iusj_school_service.entities.School;
import com.example.iusj_school_service.repositories.FiliereRepository;
import com.example.iusj_school_service.repositories.SchoolRepository;

@Service
@Transactional
public class SchoolService {

    private final SchoolRepository repository;
    private final FiliereRepository filiereRepository;

    public SchoolService(SchoolRepository repository, FiliereRepository filiereRepository) {
        this.repository = repository;
        this.filiereRepository = filiereRepository;
    }

    public List<School> getAll(String name, School.Status status) {
        Specification<School> spec = SchoolSpecifications.withFilters(name, status);
        return repository.findAll(spec, Sort.by(Sort.Direction.ASC, "name"));
    }

    public Optional<School> getById(Long id) {
        return repository.findById(id);
    }

    public School create(School school) {
        // Set the school reference on each filiere before saving
        if (school.getFilieres() != null) {
            for (Filiere filiere : school.getFilieres()) {
                filiere.setSchool(school);
            }
        }
        return repository.save(school);
    }

    public Optional<School> update(Long id, School school) {
        return repository.findById(id).map(existing -> {
            school.setId(id);
            
            // Clear existing filieres and add updated ones
            existing.getFilieres().clear();
            
            if (school.getFilieres() != null) {
                for (Filiere filiere : school.getFilieres()) {
                    filiere.setSchool(existing);
                    existing.getFilieres().add(filiere);
                }
            }
            
            // Update other fields
            existing.setName(school.getName());
            existing.setCode(school.getCode());
            existing.setDescription(school.getDescription());
            existing.setAddress(school.getAddress());
            existing.setPhone(school.getPhone());
            existing.setEmail(school.getEmail());
            existing.setStatus(school.getStatus());
            
            return repository.save(existing);
        });
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public SchoolStats stats() {
        long total = repository.count();
        long active = repository.countByStatus(School.Status.ACTIVE);
        long inactive = repository.countByStatus(School.Status.INACTIVE);
        return new SchoolStats(total, active, inactive);
    }

    // === Filière methods ===

    public List<Filiere> getFilieresBySchoolId(Long schoolId) {
        return filiereRepository.findBySchoolId(schoolId);
    }

    public Optional<Filiere> getFiliereById(Long id) {
        return filiereRepository.findById(id);
    }

    public Filiere addFiliereToSchool(Long schoolId, Filiere filiere) {
        return repository.findById(schoolId).map(school -> {
            filiere.setSchool(school);
            return filiereRepository.save(filiere);
        }).orElseThrow(() -> new RuntimeException("School not found with id " + schoolId));
    }

    public Optional<Filiere> updateFiliere(Long filiereId, Filiere filiere) {
        return filiereRepository.findById(filiereId).map(existing -> {
            existing.setCode(filiere.getCode());
            existing.setNom(filiere.getNom());
            existing.setDescription(filiere.getDescription());
            existing.setStatus(filiere.getStatus());
            return filiereRepository.save(existing);
        });
    }

    public void deleteFiliere(Long filiereId) {
        filiereRepository.deleteById(filiereId);
    }

    public List<Filiere> getAllFilieres() {
        return filiereRepository.findAll(Sort.by(Sort.Direction.ASC, "code"));
    }

    public record SchoolStats(long total, long active, long inactive) {}
}
