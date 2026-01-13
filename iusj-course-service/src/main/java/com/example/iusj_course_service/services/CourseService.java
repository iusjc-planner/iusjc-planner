package com.example.iusj_course_service.services;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.iusj_course_service.entities.Course;
import com.example.iusj_course_service.repositories.CourseRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
@Transactional
public class CourseService {

    private final CourseRepository courseRepository;

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    public List<Course> getAll(Long matiereId, Course.CourseStatus status, Course.CourseType type,
                                Long teacherId, Long roomId, Long groupId,
                                LocalDate dateFrom, LocalDate dateTo) {
        Specification<Course> spec = CourseSpecifications.withFilters(
            matiereId, status, type, teacherId, roomId, groupId, dateFrom, dateTo
        );
        return courseRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "date", "startTime"));
    }

    public List<Course> getByMatiere(Long matiereId) {
        return courseRepository.findByMatiereId(matiereId);
    }

    public List<Course> getByDate(LocalDate date) {
        return courseRepository.findByDate(date);
    }

    public List<Course> getByDateRange(LocalDate startDate, LocalDate endDate) {
        return courseRepository.findByDateBetween(startDate, endDate);
    }

    public List<Course> getByTeacherAndDate(Long teacherId, LocalDate date) {
        return courseRepository.findByTeacherIdAndDate(teacherId, date);
    }

    public List<Course> getByRoomAndDate(Long roomId, LocalDate date) {
        return courseRepository.findByRoomIdAndDate(roomId, date);
    }

    public Optional<Course> getById(Long id) {
        return courseRepository.findById(id);
    }

    public Course create(Course course) {
        return courseRepository.save(course);
    }

    public Optional<Course> update(Long id, Course course) {
        return courseRepository.findById(id).map(existing -> {
            course.setId(id);
            return courseRepository.save(course);
        });
    }

    public void delete(Long id) {
        if (!courseRepository.existsById(id)) {
            throw new EntityNotFoundException("Séance non trouvée avec l'id " + id);
        }
        courseRepository.deleteById(id);
    }

    public CourseStats stats() {
        long total = courseRepository.count();
        long scheduled = courseRepository.countByStatus(Course.CourseStatus.SCHEDULED);
        long completed = courseRepository.countByStatus(Course.CourseStatus.COMPLETED);
        long cancelled = courseRepository.countByStatus(Course.CourseStatus.CANCELLED);
        return new CourseStats(total, scheduled, completed, cancelled);
    }

    public record CourseStats(long total, long scheduled, long completed, long cancelled) {}
}
