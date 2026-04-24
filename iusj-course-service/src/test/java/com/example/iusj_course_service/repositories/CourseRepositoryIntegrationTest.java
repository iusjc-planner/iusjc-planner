package com.example.iusj_course_service.repositories;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import com.example.iusj_course_service.entities.Course;
import com.example.iusj_course_service.services.CourseSpecifications;

@DataJpaTest
class CourseRepositoryIntegrationTest {

    @Autowired
    private CourseRepository repository;

    @Test
    void findByDateBetween_shouldBeInclusiveOnBounds() {
        repository.save(buildCourse(101L, LocalDate.of(2026, 5, 1), 8, 0, Course.CourseStatus.SCHEDULED));
        repository.save(buildCourse(101L, LocalDate.of(2026, 5, 10), 10, 0, Course.CourseStatus.SCHEDULED));
        repository.save(buildCourse(101L, LocalDate.of(2026, 5, 15), 14, 0, Course.CourseStatus.CANCELLED));

        List<Course> inRange = repository.findByDateBetween(LocalDate.of(2026, 5, 1), LocalDate.of(2026, 5, 10));

        assertEquals(2, inRange.size());
        assertTrue(inRange.stream().anyMatch(course -> LocalDate.of(2026, 5, 1).equals(course.getDate())));
        assertTrue(inRange.stream().anyMatch(course -> LocalDate.of(2026, 5, 10).equals(course.getDate())));
    }

    @Test
    void specifications_shouldFilterByTeacherStatusAndDateRange() {
        repository.save(buildCourse(201L, 7L, 3L, LocalDate.of(2026, 6, 1), Course.CourseStatus.SCHEDULED));
        repository.save(buildCourse(202L, 7L, 3L, LocalDate.of(2026, 6, 5), Course.CourseStatus.SCHEDULED));
        repository.save(buildCourse(203L, 7L, 3L, LocalDate.of(2026, 6, 9), Course.CourseStatus.CANCELLED));
        repository.save(buildCourse(204L, 9L, 3L, LocalDate.of(2026, 6, 5), Course.CourseStatus.SCHEDULED));

        Specification<Course> spec = CourseSpecifications.withFilters(
                null,
                Course.CourseStatus.SCHEDULED,
                null,
                7L,
                null,
                null,
                LocalDate.of(2026, 6, 1),
                LocalDate.of(2026, 6, 7));

        List<Course> filtered = repository.findAll(spec, Sort.by(Sort.Direction.ASC, "date", "startTime"));

        assertEquals(2, filtered.size());
        assertTrue(filtered.stream().allMatch(course -> Long.valueOf(7L).equals(course.getTeacherId())));
        assertTrue(filtered.stream().allMatch(course -> Course.CourseStatus.SCHEDULED.equals(course.getStatus())));
        assertTrue(filtered.stream().noneMatch(course -> LocalDate.of(2026, 6, 9).equals(course.getDate())));
    }

    @Test
    void specifications_shouldHandleOpenEndedDateRanges() {
        repository.save(buildCourse(301L, LocalDate.of(2026, 7, 1), 8, 0, Course.CourseStatus.SCHEDULED));
        repository.save(buildCourse(301L, LocalDate.of(2026, 7, 15), 10, 0, Course.CourseStatus.SCHEDULED));
        repository.save(buildCourse(301L, LocalDate.of(2026, 7, 30), 12, 0, Course.CourseStatus.SCHEDULED));

        Specification<Course> fromOnly = CourseSpecifications.withFilters(
                null, null, null, null, null, null,
                LocalDate.of(2026, 7, 15), null);

        Specification<Course> toOnly = CourseSpecifications.withFilters(
                null, null, null, null, null, null,
                null, LocalDate.of(2026, 7, 15));

        List<Course> fromResult = repository.findAll(fromOnly);
        List<Course> toResult = repository.findAll(toOnly);

        assertEquals(2, fromResult.size());
        assertEquals(2, toResult.size());
    }

    private Course buildCourse(Long matiereId, LocalDate date, int hour, int minute, Course.CourseStatus status) {
        Course course = new Course();
        course.setMatiereId(matiereId);
        course.setDate(date);
        course.setStartTime(LocalTime.of(hour, minute));
        course.setEndTime(LocalTime.of(hour + 1, minute));
        course.setStatus(status);
        course.setType(Course.CourseType.CM);
        return course;
    }

    private Course buildCourse(Long matiereId, Long teacherId, Long roomId, LocalDate date, Course.CourseStatus status) {
        Course course = buildCourse(matiereId, date, 9, 0, status);
        course.setTeacherId(teacherId);
        course.setRoomId(roomId);
        return course;
    }
}
