package com.example.iusj_course_service.services;

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

    public List<Course> getAll(String code, String title, Course.CourseStatus status, Long teacherId, Long roomId) {
        Specification<Course> spec = CourseSpecifications.withFilters(code, title, status, teacherId, roomId);
        return courseRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "code"));
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
            throw new EntityNotFoundException("Course not found with id " + id);
        }
        courseRepository.deleteById(id);
    }
}
