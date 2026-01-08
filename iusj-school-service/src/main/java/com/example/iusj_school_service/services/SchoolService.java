package com.example.iusj_school_service.services;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.iusj_school_service.entities.School;
import com.example.iusj_school_service.repositories.SchoolRepository;

@Service
@Transactional
public class SchoolService {

    private final SchoolRepository repository;

    public SchoolService(SchoolRepository repository) {
        this.repository = repository;
    }

    public List<School> getAll(String name, School.Status status) {
        Specification<School> spec = SchoolSpecifications.withFilters(name, status);
        return repository.findAll(spec, Sort.by(Sort.Direction.ASC, "name"));
    }

    public Optional<School> getById(Long id) {
        return repository.findById(id);
    }

    public School create(School school) {
        return repository.save(school);
    }

    public Optional<School> update(Long id, School school) {
        return repository.findById(id).map(existing -> {
            school.setId(id);
            return repository.save(school);
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

    public record SchoolStats(long total, long active, long inactive) {}
}
