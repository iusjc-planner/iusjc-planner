package com.example.iusj_group_service.services;

import com.example.iusj_group_service.entities.Group;
import com.example.iusj_group_service.repositories.GroupRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class GroupService {

    private final GroupRepository repository;

    public GroupService(GroupRepository repository) {
        this.repository = repository;
    }

    public List<Group> getAll(String name, String level, Long schoolId, Group.Status status) {
        Specification<Group> spec = GroupSpecifications.withFilters(name, level, schoolId, status);
        return repository.findAll(spec, Sort.by(Sort.Direction.ASC, "name"));
    }

    public Optional<Group> getById(Long id) {
        return repository.findById(id);
    }

    public Group create(Group group) {
        return repository.save(group);
    }

    public Optional<Group> update(Long id, Group group) {
        return repository.findById(id).map(existing -> {
            group.setId(id);
            return repository.save(group);
        });
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public GroupStats stats() {
        long total = repository.count();
        long active = repository.countByStatus(Group.Status.ACTIVE);
        long inactive = repository.countByStatus(Group.Status.INACTIVE);
        return new GroupStats(total, active, inactive);
    }

    public record GroupStats(long total, long active, long inactive) {}
}
