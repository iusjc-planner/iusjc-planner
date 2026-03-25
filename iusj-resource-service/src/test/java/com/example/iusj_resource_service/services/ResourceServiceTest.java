package com.example.iusj_resource_service.services;

import com.example.iusj_resource_service.entities.Resource;
import com.example.iusj_resource_service.repositories.ResourceRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ResourceServiceTest {

    @Mock
    private ResourceRepository repository;

    @InjectMocks
    private ResourceService service;

    private Resource resource;

    @BeforeEach
    void setUp() {
        resource = new Resource();
        resource.setId(1L);
        resource.setName("Projecteur");
        resource.setType("VIDEO");
        resource.setQuantityTotal(5);
        resource.setQuantityAvailable(null);
        resource.setStatus(Resource.Status.ACTIVE);
    }

    @Test
    void create_ShouldDefaultQuantityAvailableToQuantityTotal_WhenNull() {
        when(repository.save(any(Resource.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Resource created = service.create(resource);

        assertEquals(5, created.getQuantityAvailable());
        verify(repository).save(resource);
    }

    @Test
    void update_ShouldSetIdAndDefaultQuantityAvailable_WhenFound() {
        when(repository.findById(1L)).thenReturn(Optional.of(new Resource()));
        when(repository.save(any(Resource.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Resource updated = service.update(1L, resource).orElseThrow();

        assertEquals(1L, updated.getId());
        assertEquals(5, updated.getQuantityAvailable());
    }

    @Test
    void delete_ShouldThrow_WhenResourceMissing() {
        when(repository.existsById(44L)).thenReturn(false);

        assertThrows(EntityNotFoundException.class, () -> service.delete(44L));
    }
}
