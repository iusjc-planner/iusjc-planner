package com.example.iusj_group_service.repositories;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import com.example.iusj_group_service.entities.Group;

@DataJpaTest
class GroupRepositoryIntegrationTest {

    @Autowired
    private GroupRepository repository;

    @BeforeEach
    void setUp() {
        repository.deleteAll();
    }

    @Test
    void findByFiliereIdShouldFilterAndSortByNameAsc() {
        repository.save(group("B2", 1L, null, Group.GroupType.PRINCIPAL, Group.Status.ACTIVE, 30));
        repository.save(group("A1", 1L, null, Group.GroupType.PRINCIPAL, Group.Status.ACTIVE, 28));
        repository.save(group("Z9", 2L, null, Group.GroupType.PRINCIPAL, Group.Status.ACTIVE, 24));

        List<Group> result = repository.findByFiliereIdOrderByNameAsc(1L);

        assertThat(result).extracting(Group::getName).containsExactly("A1", "B2");
    }

    @Test
    void findByParentGroupIdShouldReturnOrderedChildren() {
        Group parent = repository.save(group("L1 A", 3L, null, Group.GroupType.PRINCIPAL, Group.Status.ACTIVE, 40));
        repository.save(group("L1 A - TP2", 3L, parent.getId(), Group.GroupType.TP, Group.Status.ACTIVE, 20));
        repository.save(group("L1 A - TP1", 3L, parent.getId(), Group.GroupType.TP, Group.Status.ACTIVE, 20));

        List<Group> children = repository.findByParentGroupIdOrderByNameAsc(parent.getId());

        assertThat(children).hasSize(2);
        assertThat(children).extracting(Group::getName).containsExactly("L1 A - TP1", "L1 A - TP2");
    }

    @Test
    void countAndExistsShouldMatchPersistedData() {
        repository.save(group("ACTIVE-1", 10L, null, Group.GroupType.PRINCIPAL, Group.Status.ACTIVE, 32));
        repository.save(group("ACTIVE-2", 10L, null, Group.GroupType.TD, Group.Status.ACTIVE, 16));
        repository.save(group("INACTIVE-1", 20L, null, Group.GroupType.PRINCIPAL, Group.Status.INACTIVE, 12));

        assertThat(repository.countByStatus(Group.Status.ACTIVE)).isEqualTo(2);
        assertThat(repository.countByStatus(Group.Status.INACTIVE)).isEqualTo(1);
        assertThat(repository.countByFiliereId(10L)).isEqualTo(2);
        assertThat(repository.existsByName("ACTIVE-2")).isTrue();
        assertThat(repository.existsByName("MISSING")).isFalse();
    }

    private Group group(String name, Long filiereId, Long parentGroupId, Group.GroupType type, Group.Status status, Integer size) {
        Group group = new Group();
        group.setName(name);
        group.setLevel("L1");
        group.setSchoolId(100L);
        group.setFiliereId(filiereId);
        group.setParentGroupId(parentGroupId);
        group.setGroupType(type);
        group.setStatus(status);
        group.setSize(size);
        return group;
    }
}
