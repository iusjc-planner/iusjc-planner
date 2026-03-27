package com.example.iusj_resource_service.services;

import java.util.Optional;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.iusj_resource_service.entities.Resource;
import com.example.iusj_resource_service.repositories.ResourceRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
@Transactional
public class ResourceService {

    private final ResourceRepository repository;

    public ResourceService(ResourceRepository repository) {
        this.repository = repository;
    }

    public List<Resource> getAll(String name, String type, Resource.Status status) {
        Specification<Resource> spec = ResourceSpecifications.withFilters(name, type, status);
        return repository.findAll(spec, Sort.by(Sort.Direction.ASC, "name"));
    }

    public Optional<Resource> getById(Long id) {
        return repository.findById(id);
    }

    public Resource create(Resource resource) {
        if (resource.getQuantityAvailable() == null) {
            resource.setQuantityAvailable(resource.getQuantityTotal());
        }
        return repository.save(resource);
    }

    public Optional<Resource> update(Long id, Resource resource) {
        return repository.findById(id).map(existing -> {
            resource.setId(id);
            if (resource.getQuantityAvailable() == null) {
                resource.setQuantityAvailable(resource.getQuantityTotal());
            }
            return repository.save(resource);
        });
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Resource not found with id " + id);
        }
        repository.deleteById(id);
    }

    public ResourceStats stats() {
        long total = repository.count();
        long active = repository.countByStatus(Resource.Status.ACTIVE);
        long inactive = repository.countByStatus(Resource.Status.INACTIVE);
        return new ResourceStats(total, active, inactive);
    }

    public record ResourceStats(long total, long active, long inactive) {}
}
