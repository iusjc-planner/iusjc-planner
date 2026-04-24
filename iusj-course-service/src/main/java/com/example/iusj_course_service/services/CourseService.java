package com.example.iusj_course_service.services;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.iusj_course_service.entities.Course;
import com.example.iusj_course_service.entities.Matiere;
import com.example.iusj_course_service.repositories.CourseRepository;
import com.example.iusj_course_service.repositories.MatiereRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
@Transactional
public class CourseService {

    private final CourseRepository courseRepository;
    private final MatiereRepository matiereRepository;

    public CourseService(CourseRepository courseRepository, MatiereRepository matiereRepository) {
        this.courseRepository = courseRepository;
        this.matiereRepository = matiereRepository;
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

    public List<Course> getBySchool(Long schoolId) {
        List<Long> matiereIds = matiereRepository.findBySchoolId(schoolId).stream()
                .map(Matiere::getId)
                .filter(id -> id != null)
                .collect(Collectors.toList());
        if (matiereIds.isEmpty()) {
            return List.of();
        }
        return courseRepository.findByMatiereIdInOrderByDateAscStartTimeAsc(matiereIds);
    }

    public List<Course> getBySchoolAndFiliere(Long schoolId, Long filiereId) {
        Set<Long> schoolMatiereIds = matiereRepository.findBySchoolId(schoolId).stream()
                .map(Matiere::getId)
                .filter(id -> id != null)
                .collect(Collectors.toSet());
        if (schoolMatiereIds.isEmpty()) {
            return List.of();
        }

        Set<Long> filiereMatiereIds = matiereRepository.findByFiliereId(filiereId).stream()
                .map(Matiere::getId)
                .filter(id -> id != null)
                .collect(Collectors.toSet());
        if (filiereMatiereIds.isEmpty()) {
            return List.of();
        }

        Set<Long> intersection = new HashSet<>(schoolMatiereIds);
        intersection.retainAll(filiereMatiereIds);
        if (intersection.isEmpty()) {
            return List.of();
        }

        return courseRepository.findByMatiereIdInOrderByDateAscStartTimeAsc(intersection.stream().toList());
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

    public List<Course> getPrerequisites(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new EntityNotFoundException("Séance non trouvée avec l'id " + courseId));
        Set<Long> prerequisiteIds = course.getPrerequisiteCourseIds();
        if (prerequisiteIds == null || prerequisiteIds.isEmpty()) {
            return List.of();
        }
        return courseRepository.findAllById(prerequisiteIds).stream()
                .sorted((a, b) -> a.getId().compareTo(b.getId()))
                .collect(Collectors.toList());
    }

    public Course updatePrerequisites(Long courseId, List<Long> prerequisiteIds) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new EntityNotFoundException("Séance non trouvée avec l'id " + courseId));

        Set<Long> requestedIds = (prerequisiteIds == null ? List.<Long>of() : prerequisiteIds).stream()
                .filter(id -> id != null)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        if (requestedIds.contains(courseId)) {
            throw new IllegalArgumentException("Un cours ne peut pas être son propre prérequis");
        }

        List<Course> prerequisites = courseRepository.findAllById(requestedIds);
        if (prerequisites.size() != requestedIds.size()) {
            throw new EntityNotFoundException("Un ou plusieurs cours prérequis sont introuvables");
        }

        course.setPrerequisiteCourseIds(requestedIds);
        return courseRepository.save(course);
    }

    public Course create(Course course) {
        resolveTitle(course);
        return courseRepository.save(course);
    }

    public Optional<Course> update(Long id, Course course) {
        return courseRepository.findById(id).map(existing -> {
            course.setId(id);
            resolveTitle(course);
            return courseRepository.save(course);
        });
    }

    /**
     * Sets the course title from the matière name if not already set.
     */
    private void resolveTitle(Course course) {
        if (course.getMatiereId() != null) {
            matiereRepository.findById(course.getMatiereId()).ifPresent(matiere ->
                course.setTitle(matiere.getNom())
            );
        }
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
