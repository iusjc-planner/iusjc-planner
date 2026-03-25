package com.example.iusj_group_service.services;

import com.example.iusj_group_service.entities.Group;
import com.example.iusj_group_service.repositories.GroupRepository;
import jakarta.persistence.EntityNotFoundException;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
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

    public List<Group> getAll(String name, String level, Long schoolId, Long filiereId, Group.Status status) {
        Specification<Group> spec = GroupSpecifications.withFilters(name, level, schoolId, filiereId, status);
        return repository.findAll(spec, Sort.by(Sort.Direction.ASC, "name"));
    }

    public List<Group> getByFiliere(Long filiereId) {
        return repository.findByFiliereIdOrderByNameAsc(filiereId);
    }

    public Optional<Group> getById(Long id) {
        return repository.findById(id);
    }

    public List<Group> getSubGroups(Long groupId) {
        if (!repository.existsById(groupId)) {
            throw new EntityNotFoundException("Groupe introuvable: " + groupId);
        }
        return repository.findByParentGroupIdOrderByNameAsc(groupId);
    }

    public Group create(Group group) {
        validateFiliere(group);
        return repository.save(group);
    }

    public Optional<Group> update(Long id, Group group) {
        return repository.findById(id).map(existing -> {
            group.setId(id);
            validateFiliere(group);
            return repository.save(group);
        });
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public List<Group> split(Long groupId, Integer count, Group.GroupType type) {
        if (count == null || count < 2 || count > 10) {
            throw new IllegalArgumentException("count doit etre entre 2 et 10");
        }
        if (type == null) {
            throw new IllegalArgumentException("type est requis");
        }

        Group parent = repository.findById(groupId)
            .orElseThrow(() -> new EntityNotFoundException("Groupe introuvable: " + groupId));

        int depth = computeDepth(parent);
        if (depth >= 2) {
            throw new IllegalArgumentException("Division interdite: profondeur maximale atteinte (Principal -> TD -> TP)");
        }
        validateSplitType(parent.getGroupType(), depth, type);

        Integer parentSize = parent.getSize() == null ? 0 : Math.max(parent.getSize(), 0);
        int baseSize = parentSize / count;
        int remainder = parentSize % count;

        List<Group> subGroups = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            Group child = new Group();
            child.setName(generateUniqueName(parent.getName(), type, i));
            child.setLevel(parent.getLevel());
            child.setSchoolId(parent.getSchoolId());
            child.setFiliereId(parent.getFiliereId());
            child.setStatus(parent.getStatus());
            child.setGroupType(type);
            child.setParentGroupId(parent.getId());
            child.setSize(baseSize + (i <= remainder ? 1 : 0));
            subGroups.add(child);
        }

        return repository.saveAll(subGroups);
    }

    public GroupStats stats() {
        long total = repository.count();
        long active = repository.countByStatus(Group.Status.ACTIVE);
        long inactive = repository.countByStatus(Group.Status.INACTIVE);
        return new GroupStats(total, active, inactive);
    }

    private void validateFiliere(Group group) {
        if (group.getFiliereId() == null) {
            throw new IllegalArgumentException("filiereId est requis");
        }
    }

    private int computeDepth(Group group) {
        int depth = 0;
        Long currentParentId = group.getParentGroupId();
        while (currentParentId != null) {
            depth++;
            Group parent = repository.findById(currentParentId)
                .orElseThrow(() -> new IllegalArgumentException("Hierarchie invalide: parent introuvable"));
            currentParentId = parent.getParentGroupId();
        }
        return depth;
    }

    private void validateSplitType(Group.GroupType parentType, int depth, Group.GroupType requestedType) {
        Group.GroupType effectiveParentType = parentType == null ? Group.GroupType.PRINCIPAL : parentType;

        if (effectiveParentType == Group.GroupType.TP) {
            throw new IllegalArgumentException("Un groupe TP ne peut pas etre divise");
        }
        if (depth == 0 && requestedType == Group.GroupType.TP) {
            throw new IllegalArgumentException("Un groupe principal doit etre divise en TD avant TP");
        }
        if (effectiveParentType == Group.GroupType.TD && requestedType != Group.GroupType.TP) {
            throw new IllegalArgumentException("Un groupe TD ne peut etre divise qu'en TP");
        }
    }

    private String generateUniqueName(String parentName, Group.GroupType type, int index) {
        String suffix = type.name().toUpperCase(Locale.ROOT);
        String base = parentName + " - " + suffix + index;
        if (!repository.existsByName(base)) {
            return base;
        }
        int candidate = 2;
        String name = base + " (" + candidate + ")";
        while (repository.existsByName(name)) {
            candidate++;
            name = base + " (" + candidate + ")";
        }
        return name;
    }

    public record GroupStats(long total, long active, long inactive) {}
}
