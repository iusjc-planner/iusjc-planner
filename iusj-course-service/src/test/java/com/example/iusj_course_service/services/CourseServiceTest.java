package com.example.iusj_course_service.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.Collections;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.example.iusj_course_service.entities.Course;
import com.example.iusj_course_service.entities.Matiere;
import com.example.iusj_course_service.repositories.CourseRepository;
import com.example.iusj_course_service.repositories.MatiereRepository;

import jakarta.persistence.EntityNotFoundException;

@ExtendWith(MockitoExtension.class)
class CourseServiceTest {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private MatiereRepository matiereRepository;

    @InjectMocks
    private CourseService courseService;

    @Test
    void createShouldResolveTitleFromMatiere() {
        Course course = buildCourse();
        ReflectionTestUtils.setField(course, "matiereId", 11L);

        Matiere matiere = new Matiere();
        ReflectionTestUtils.setField(matiere, "id", 11L);
        ReflectionTestUtils.setField(matiere, "nom", "Algebre lineaire");

        when(matiereRepository.findById(11L)).thenReturn(Optional.of(matiere));
        when(courseRepository.save(any(Course.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Course saved = courseService.create(course);

        assertEquals("Algebre lineaire", ReflectionTestUtils.getField(saved, "title"));
    }

    @Test
    void updateShouldReturnEmptyWhenCourseDoesNotExist() {
        when(courseRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<Course> result = courseService.update(99L, buildCourse());

        assertTrue(result.isEmpty());
        verify(courseRepository, never()).save(any(Course.class));
    }

    @Test
    void updateShouldPreserveRequestedIdAndResolveTitle() {
        Course existing = buildCourse();
        ReflectionTestUtils.setField(existing, "id", 3L);
        ReflectionTestUtils.setField(existing, "matiereId", 50L);

        Course incoming = buildCourse();
        ReflectionTestUtils.setField(incoming, "matiereId", 50L);

        Matiere matiere = new Matiere();
        ReflectionTestUtils.setField(matiere, "id", 50L);
        ReflectionTestUtils.setField(matiere, "nom", "Programmation Java");

        when(courseRepository.findById(3L)).thenReturn(Optional.of(existing));
        when(matiereRepository.findById(50L)).thenReturn(Optional.of(matiere));
        when(courseRepository.save(any(Course.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Optional<Course> updated = courseService.update(3L, incoming);

        assertTrue(updated.isPresent());
        assertEquals(3L, ReflectionTestUtils.getField(updated.get(), "id"));
        assertEquals("Programmation Java", ReflectionTestUtils.getField(updated.get(), "title"));
    }

    @Test
    void deleteShouldThrowWhenCourseNotFound() {
        when(courseRepository.existsById(777L)).thenReturn(false);

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> courseService.delete(777L));

        assertTrue(exception.getMessage().contains("Séance non trouvée"));
        verify(courseRepository, never()).deleteById(any());
    }

    @Test
    void statsShouldAggregateRepositoryCounters() {
        when(courseRepository.count()).thenReturn(12L);
        when(courseRepository.countByStatus(eq(Course.CourseStatus.SCHEDULED))).thenReturn(7L);
        when(courseRepository.countByStatus(eq(Course.CourseStatus.COMPLETED))).thenReturn(3L);
        when(courseRepository.countByStatus(eq(Course.CourseStatus.CANCELLED))).thenReturn(2L);

        CourseService.CourseStats stats = courseService.stats();

        assertEquals(12L, stats.total());
        assertEquals(7L, stats.scheduled());
        assertEquals(3L, stats.completed());
        assertEquals(2L, stats.cancelled());
    }

    @Test
    void createShouldSaveCourseWithResolvedFields() {
        Course course = buildCourse();
        ReflectionTestUtils.setField(course, "matiereId", 31L);

        Matiere matiere = new Matiere();
        ReflectionTestUtils.setField(matiere, "id", 31L);
        ReflectionTestUtils.setField(matiere, "nom", "Reseaux");

        when(matiereRepository.findById(31L)).thenReturn(Optional.of(matiere));
        when(courseRepository.save(any(Course.class))).thenAnswer(invocation -> invocation.getArgument(0));

        courseService.create(course);

        ArgumentCaptor<Course> captor = ArgumentCaptor.forClass(Course.class);
        verify(courseRepository).save(captor.capture());
        assertEquals("Reseaux", ReflectionTestUtils.getField(captor.getValue(), "title"));
        assertEquals(Course.CourseStatus.SCHEDULED, ReflectionTestUtils.getField(captor.getValue(), "status"));
    }

    @Test
    void getBySchoolShouldResolveMatieresThenCourses() {
        Matiere matiere1 = new Matiere();
        ReflectionTestUtils.setField(matiere1, "id", 10L);
        Matiere matiere2 = new Matiere();
        ReflectionTestUtils.setField(matiere2, "id", 11L);

        Course course = buildCourse();
        ReflectionTestUtils.setField(course, "matiereId", 10L);

        when(matiereRepository.findBySchoolId(5L)).thenReturn(List.of(matiere1, matiere2));
        when(courseRepository.findByMatiereIdInOrderByDateAscStartTimeAsc(List.of(10L, 11L))).thenReturn(List.of(course));

        List<Course> result = courseService.getBySchool(5L);

        assertEquals(1, result.size());
        assertEquals(10L, ReflectionTestUtils.getField(result.get(0), "matiereId"));
    }

    @Test
    void getBySchoolAndFiliereShouldReturnIntersectionCourses() {
        Matiere schoolMatiere = new Matiere();
        ReflectionTestUtils.setField(schoolMatiere, "id", 10L);
        Matiere schoolOnlyMatiere = new Matiere();
        ReflectionTestUtils.setField(schoolOnlyMatiere, "id", 11L);
        Matiere filiereMatiere = new Matiere();
        ReflectionTestUtils.setField(filiereMatiere, "id", 10L);

        Course course = buildCourse();
        ReflectionTestUtils.setField(course, "matiereId", 10L);

        when(matiereRepository.findBySchoolId(5L)).thenReturn(List.of(schoolMatiere, schoolOnlyMatiere));
        when(matiereRepository.findByFiliereId(9L)).thenReturn(List.of(filiereMatiere));
        when(courseRepository.findByMatiereIdInOrderByDateAscStartTimeAsc(List.of(10L))).thenReturn(List.of(course));

        List<Course> result = courseService.getBySchoolAndFiliere(5L, 9L);

        assertEquals(1, result.size());
        assertEquals(10L, ReflectionTestUtils.getField(result.get(0), "matiereId"));
    }

    @Test
    void getBySchoolAndFiliereShouldReturnEmptyWhenNoIntersection() {
        Matiere schoolMatiere = new Matiere();
        ReflectionTestUtils.setField(schoolMatiere, "id", 10L);
        Matiere filiereMatiere = new Matiere();
        ReflectionTestUtils.setField(filiereMatiere, "id", 12L);

        when(matiereRepository.findBySchoolId(5L)).thenReturn(List.of(schoolMatiere));
        when(matiereRepository.findByFiliereId(9L)).thenReturn(List.of(filiereMatiere));

        List<Course> result = courseService.getBySchoolAndFiliere(5L, 9L);

        assertEquals(Collections.emptyList(), result);
    }

    @Test
    void getPrerequisitesShouldReturnLinkedCourses() {
        Course course = buildCourse();
        ReflectionTestUtils.setField(course, "id", 20L);
        ReflectionTestUtils.setField(course, "prerequisiteCourseIds", new LinkedHashSet<>(List.of(5L, 7L)));

        Course prerequisite1 = buildCourse();
        ReflectionTestUtils.setField(prerequisite1, "id", 5L);
        Course prerequisite2 = buildCourse();
        ReflectionTestUtils.setField(prerequisite2, "id", 7L);

        when(courseRepository.findById(20L)).thenReturn(Optional.of(course));
        when(courseRepository.findAllById(new LinkedHashSet<>(List.of(5L, 7L)))).thenReturn(List.of(prerequisite1, prerequisite2));

        List<Course> result = courseService.getPrerequisites(20L);

        assertEquals(2, result.size());
        assertEquals(5L, ReflectionTestUtils.getField(result.get(0), "id"));
    }

    @Test
    void updatePrerequisitesShouldRejectSelfReference() {
        Course course = buildCourse();
        ReflectionTestUtils.setField(course, "id", 8L);
        when(courseRepository.findById(8L)).thenReturn(Optional.of(course));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> courseService.updatePrerequisites(8L, List.of(8L, 10L)));

        assertTrue(exception.getMessage().contains("propre prérequis"));
    }

    @Test
    void updatePrerequisitesShouldPersistWhenAllIdsExist() {
        Course course = buildCourse();
        ReflectionTestUtils.setField(course, "id", 30L);
        ReflectionTestUtils.setField(course, "prerequisiteCourseIds", new LinkedHashSet<Long>());

        Course prerequisite = buildCourse();
        ReflectionTestUtils.setField(prerequisite, "id", 40L);

        when(courseRepository.findById(30L)).thenReturn(Optional.of(course));
        when(courseRepository.findAllById(new LinkedHashSet<>(List.of(40L)))).thenReturn(List.of(prerequisite));
        when(courseRepository.save(any(Course.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Course updated = courseService.updatePrerequisites(30L, List.of(40L));

        @SuppressWarnings("unchecked")
        Set<Long> prerequisiteIds = (Set<Long>) ReflectionTestUtils.getField(updated, "prerequisiteCourseIds");
        assertTrue(prerequisiteIds.contains(40L));
    }

    private Course buildCourse() {
        Course course = new Course();
        ReflectionTestUtils.setField(course, "date", LocalDate.of(2026, 5, 4));
        ReflectionTestUtils.setField(course, "startTime", LocalTime.of(8, 0));
        ReflectionTestUtils.setField(course, "endTime", LocalTime.of(10, 0));
        ReflectionTestUtils.setField(course, "status", Course.CourseStatus.SCHEDULED);
        return course;
    }
}
