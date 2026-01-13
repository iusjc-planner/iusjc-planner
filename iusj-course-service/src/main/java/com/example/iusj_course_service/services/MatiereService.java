package com.example.iusj_course_service.services;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.iusj_course_service.entities.Matiere;
import com.example.iusj_course_service.repositories.MatiereRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.criteria.Predicate;

@Service
@Transactional
public class MatiereService {

    private final MatiereRepository matiereRepository;

    public MatiereService(MatiereRepository matiereRepository) {
        this.matiereRepository = matiereRepository;
    }

    public List<Matiere> getAll(String code, String nom, Matiere.MatiereStatus status, 
                                 Long schoolId, Long filiereId, Long teacherId) {
        Specification<Matiere> spec = (root, query, cb) -> {
            Predicate predicate = cb.conjunction();
            
            if (code != null && !code.isEmpty()) {
                predicate = cb.and(predicate, cb.like(cb.lower(root.get("code")), "%" + code.toLowerCase() + "%"));
            }
            if (nom != null && !nom.isEmpty()) {
                predicate = cb.and(predicate, cb.like(cb.lower(root.get("nom")), "%" + nom.toLowerCase() + "%"));
            }
            if (status != null) {
                predicate = cb.and(predicate, cb.equal(root.get("status"), status));
            }
            if (schoolId != null) {
                predicate = cb.and(predicate, cb.equal(root.get("schoolId"), schoolId));
            }
            if (filiereId != null) {
                predicate = cb.and(predicate, cb.equal(root.get("filiereId"), filiereId));
            }
            if (teacherId != null) {
                predicate = cb.and(predicate, cb.equal(root.get("teacherId"), teacherId));
            }
            
            return predicate;
        };
        
        return matiereRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "code"));
    }

    public Optional<Matiere> getById(Long id) {
        return matiereRepository.findById(id);
    }

    public Optional<Matiere> getByCode(String code) {
        return matiereRepository.findByCode(code);
    }

    public List<Matiere> getBySchoolId(Long schoolId) {
        return matiereRepository.findBySchoolId(schoolId);
    }

    public List<Matiere> getByFiliereId(Long filiereId) {
        return matiereRepository.findByFiliereId(filiereId);
    }

    public List<Matiere> getByTeacherId(Long teacherId) {
        return matiereRepository.findByTeacherId(teacherId);
    }

    public Matiere create(Matiere matiere) {
        if (matiereRepository.existsByCode(matiere.getCode())) {
            throw new IllegalArgumentException("Une matière avec le code " + matiere.getCode() + " existe déjà");
        }
        return matiereRepository.save(matiere);
    }

    public Optional<Matiere> update(Long id, Matiere matiere) {
        return matiereRepository.findById(id).map(existing -> {
            // Check if code changed and new code already exists
            if (!existing.getCode().equals(matiere.getCode()) && matiereRepository.existsByCode(matiere.getCode())) {
                throw new IllegalArgumentException("Une matière avec le code " + matiere.getCode() + " existe déjà");
            }
            matiere.setId(id);
            return matiereRepository.save(matiere);
        });
    }

    public void delete(Long id) {
        if (!matiereRepository.existsById(id)) {
            throw new EntityNotFoundException("Matière non trouvée avec l'id " + id);
        }
        matiereRepository.deleteById(id);
    }

    public MatiereStats stats() {
        long total = matiereRepository.count();
        long active = matiereRepository.countByStatus(Matiere.MatiereStatus.ACTIVE);
        long inactive = matiereRepository.countByStatus(Matiere.MatiereStatus.INACTIVE);
        int totalCredits = matiereRepository.findAll().stream()
                .mapToInt(Matiere::getCredits)
                .sum();
        int totalHours = matiereRepository.findAll().stream()
                .mapToInt(Matiere::getHoursTotal)
                .sum();
        return new MatiereStats(total, active, inactive, totalCredits, totalHours);
    }

    public record MatiereStats(long total, long active, long inactive, int totalCredits, int totalHours) {}
}
