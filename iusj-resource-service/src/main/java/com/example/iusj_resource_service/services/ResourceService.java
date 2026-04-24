package com.example.iusj_resource_service.services;

import com.example.iusj_resource_service.entities.Resource;
import com.example.iusj_resource_service.repositories.ResourceRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ResourceService {

    private final ResourceRepository repository;

    public ResourceService(ResourceRepository repository) {
        this.repository = repository;
    }

    public List<Resource> getAll(String nom, Resource.TypeRessource type, Resource.StatutRessource statut) {
        return repository.findAll(
                ResourceSpecifications.withFilters(nom, type, statut),
                Sort.by(Sort.Direction.ASC, "nom")
        );
    }

    public Optional<Resource> getById(Long id) {
        return repository.findById(id);
    }

    public Resource create(Resource resource) {
        if (resource.getStatut() == null) {
            resource.setStatut(Resource.StatutRessource.DISPONIBLE);
        }
        return repository.save(resource);
    }

    public Optional<Resource> update(Long id, Resource resource) {
        return repository.findById(id).map(existing -> {
            resource.setId(id);
            resource.setCreatedAt(existing.getCreatedAt());
            return repository.save(resource);
        });
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Resource not found with id " + id);
        }
        repository.deleteById(id);
    }

    public ResourceStats getStats() {
        long total = repository.count();
        long disponible = repository.countByStatut(Resource.StatutRessource.DISPONIBLE);
        long reserve = repository.countByStatut(Resource.StatutRessource.RESERVE);
        long maintenance = repository.countByStatut(Resource.StatutRessource.MAINTENANCE);
        return new ResourceStats(total, disponible, reserve, maintenance);
    }

    public record ResourceStats(long total, long disponible, long reserve, long maintenance) {}
}
