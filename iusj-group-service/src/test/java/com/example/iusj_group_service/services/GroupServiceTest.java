package com.example.iusj_group_service.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.example.iusj_group_service.entities.Group;
import com.example.iusj_group_service.repositories.GroupRepository;

import jakarta.persistence.EntityNotFoundException;

@ExtendWith(MockitoExtension.class)
class GroupServiceTest {

    @Mock
    private GroupRepository repository;

    @InjectMocks
    private GroupService service;

    @Test
    void createShouldRejectNullFiliere() {
        Group group = new Group();
        ReflectionTestUtils.setField(group, "name", "L1 A");

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> service.create(group));

        assertTrue(exception.getMessage().contains("filiereId"));
        verify(repository, never()).save(any(Group.class));
    }

    @Test
    void getSubGroupsShouldThrowWhenParentMissing() {
        when(repository.existsById(99L)).thenReturn(false);

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> service.getSubGroups(99L));

        assertTrue(exception.getMessage().contains("introuvable"));
    }

    @Test
    void splitShouldCreateRequestedSubGroups() {
        Group parent = new Group();
        ReflectionTestUtils.setField(parent, "id", 1L);
        ReflectionTestUtils.setField(parent, "name", "L2 INFO");
        ReflectionTestUtils.setField(parent, "filiereId", 10L);
        ReflectionTestUtils.setField(parent, "size", 31);
        ReflectionTestUtils.setField(parent, "groupType", Group.GroupType.PRINCIPAL);
        ReflectionTestUtils.setField(parent, "status", Group.Status.ACTIVE);
        ReflectionTestUtils.setField(parent, "parentGroupId", null);

        when(repository.findById(1L)).thenReturn(Optional.of(parent));
        when(repository.existsByName(any())).thenReturn(false);
        when(repository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        List<Group> created = service.split(1L, 3, Group.GroupType.TD);

        assertEquals(3, created.size());
        assertEquals("L2 INFO - TD1", ReflectionTestUtils.getField(created.get(0), "name"));
        assertEquals(11, ReflectionTestUtils.getField(created.get(0), "size"));
        assertEquals(10, ReflectionTestUtils.getField(created.get(2), "size"));
    }

    @Test
    void splitShouldRejectTpSplitFromPrincipal() {
        Group parent = new Group();
        ReflectionTestUtils.setField(parent, "id", 1L);
        ReflectionTestUtils.setField(parent, "filiereId", 10L);
        ReflectionTestUtils.setField(parent, "groupType", Group.GroupType.PRINCIPAL);
        ReflectionTestUtils.setField(parent, "parentGroupId", null);

        when(repository.findById(1L)).thenReturn(Optional.of(parent));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> service.split(1L, 2, Group.GroupType.TP));

        assertTrue(exception.getMessage().contains("TD"));
    }

    @Test
    void statsShouldAggregateRepositoryCounters() {
        when(repository.count()).thenReturn(15L);
        when(repository.countByStatus(Group.Status.ACTIVE)).thenReturn(12L);
        when(repository.countByStatus(Group.Status.INACTIVE)).thenReturn(3L);

        GroupService.GroupStats stats = service.stats();

        assertEquals(15L, stats.total());
        assertEquals(12L, stats.active());
        assertEquals(3L, stats.inactive());
    }
}
