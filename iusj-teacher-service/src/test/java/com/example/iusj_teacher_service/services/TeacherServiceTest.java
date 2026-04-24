package com.example.iusj_teacher_service.services;

import com.example.iusj_teacher_service.entities.Teacher;
import com.example.iusj_teacher_service.repository.TeacherRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TeacherServiceTest {

    @Mock
    private TeacherRepository teacherRepository;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private TeacherService teacherService;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getAllShouldReturnTeachers() {
        Teacher teacher = teacher(1L, 10L, Set.of("Maths"));
        when(teacherRepository.findAll()).thenReturn(List.of(teacher));

        List<Teacher> result = teacherService.getAll();

        assertEquals(1, result.size());
        assertEquals(10L, ReflectionTestUtils.getField(result.get(0), "userId"));
        verify(teacherRepository).findAll();
    }

    @Test
    void getByIdShouldReturnTeacher() {
        Teacher teacher = teacher(1L, 10L, Set.of("Maths"));
        when(teacherRepository.findById(1L)).thenReturn(Optional.of(teacher));

        Optional<Teacher> result = teacherService.getById(1L);

        assertTrue(result.isPresent());
        assertEquals(10L, ReflectionTestUtils.getField(result.get(), "userId"));
    }

    @Test
    void getByUserIdShouldReturnTeacher() {
        Teacher teacher = teacher(1L, 10L, Set.of("Maths"));
        when(teacherRepository.findByUserId(10L)).thenReturn(Optional.of(teacher));

        Optional<Teacher> result = teacherService.getByUserId(10L);

        assertTrue(result.isPresent());
        assertEquals(1L, ReflectionTestUtils.getField(result.get(), "id"));
    }

    @Test
    void createShouldPersistNewTeacher() {
        when(teacherRepository.findByUserId(10L)).thenReturn(Optional.empty());
        when(teacherRepository.save(any(Teacher.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Teacher result = teacherService.create(10L, Set.of("Maths", "Physique"));

        assertEquals(10L, ReflectionTestUtils.getField(result, "userId"));
        assertTrue(getSpecialities(result).contains("Maths"));
        assertTrue(getSpecialities(result).contains("Physique"));
        verify(teacherRepository).save(any(Teacher.class));
    }

    @Test
    void createShouldRejectDuplicateUserId() {
        when(teacherRepository.findByUserId(10L)).thenReturn(Optional.of(new Teacher()));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> teacherService.create(10L, Set.of("Maths")));

        assertTrue(exception.getMessage().contains("déjà"));
    }

    @Test
    void updateShouldModifySpecialitiesWhenTeacherExists() {
        Teacher teacher = teacher(1L, 10L, Set.of("Maths"));
        when(teacherRepository.findById(1L)).thenReturn(Optional.of(teacher));
        when(teacherRepository.save(any(Teacher.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Optional<Teacher> result = teacherService.update(1L, Set.of("Physique"));

        assertTrue(result.isPresent());
        assertTrue(getSpecialities(result.get()).contains("Physique"));
        verify(teacherRepository).save(eq(teacher));
    }

    @Test
    void addSpecialityShouldAppendValue() {
        Teacher teacher = teacher(1L, 10L, Set.of("Maths"));
        when(teacherRepository.findById(1L)).thenReturn(Optional.of(teacher));
        when(teacherRepository.save(any(Teacher.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Optional<Teacher> result = teacherService.addSpeciality(1L, "Physique");

        assertTrue(result.isPresent());
        assertTrue(getSpecialities(result.get()).contains("Physique"));
    }

    @Test
    void removeSpecialityShouldRemoveValue() {
        Teacher teacher = teacher(1L, 10L, Set.of("Maths", "Physique"));
        when(teacherRepository.findById(1L)).thenReturn(Optional.of(teacher));
        when(teacherRepository.save(any(Teacher.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Optional<Teacher> result = teacherService.removeSpeciality(1L, "Physique");

        assertTrue(result.isPresent());
        assertFalse(getSpecialities(result.get()).contains("Physique"));
    }

    @Test
    void getCurrentTeacherShouldResolveTeacherFromLogin() {
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken("jane.doe", null, List.of())
        );
        when(restTemplate.getForEntity("http://iusj-user-service/api/users/login/jane.doe", Map.class))
                .thenReturn(new ResponseEntity<>(Map.of("id", 42), HttpStatus.OK));
        Teacher teacher = teacher(1L, 42L, Set.of("Maths"));
        when(teacherRepository.findByUserId(42L)).thenReturn(Optional.of(teacher));

        Teacher result = teacherService.getCurrentTeacher();

        assertNotNull(result);
        assertEquals(42L, ReflectionTestUtils.getField(result, "userId"));
    }

    @Test
    void getCurrentTeacherShouldReturnNullWhenUnauthenticated() {
        assertNull(teacherService.getCurrentTeacher());
    }

    private Teacher teacher(Long id, Long userId, Set<String> specialities) {
        Teacher teacher = new Teacher();
        ReflectionTestUtils.setField(teacher, "id", id);
        ReflectionTestUtils.setField(teacher, "userId", userId);
        ReflectionTestUtils.setField(teacher, "specialities", new java.util.HashSet<>(specialities));
        return teacher;
    }

    @SuppressWarnings("unchecked")
    private Set<String> getSpecialities(Teacher teacher) {
        return (Set<String>) ReflectionTestUtils.getField(teacher, "specialities");
    }
}
