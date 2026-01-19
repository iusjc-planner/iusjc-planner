package com.example.iusj_course_service.controller;

import java.time.LocalDate;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.iusj_course_service.entities.Course;
import com.example.iusj_course_service.services.CourseService;

import jakarta.validation.Valid;

/**
 * Contrôleur pour les séances de cours
 */
@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private static final Logger logger = LoggerFactory.getLogger(CourseController.class);

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public List<Course> listCourses(
            @RequestParam(required = false) Long matiereId,
            @RequestParam(required = false) Course.CourseStatus status,
            @RequestParam(required = false) Course.CourseType type,
            @RequestParam(required = false) Long teacherId,
            @RequestParam(required = false) Long roomId,
            @RequestParam(required = false) Long groupId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        return courseService.getAll(matiereId, status, type, teacherId, roomId, groupId, dateFrom, dateTo);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourse(@PathVariable Long id) {
        return courseService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/matiere/{matiereId}")
    public List<Course> getCoursesByMatiere(@PathVariable Long matiereId) {
        return courseService.getByMatiere(matiereId);
    }

    @GetMapping("/date/{date}")
    public List<Course> getCoursesByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return courseService.getByDate(date);
    }

    @GetMapping("/date-range")
    public List<Course> getCoursesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return courseService.getByDateRange(startDate, endDate);
    }

    @GetMapping("/teacher/{teacherId}/date/{date}")
    public List<Course> getCoursesByTeacherAndDate(
            @PathVariable Long teacherId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return courseService.getByTeacherAndDate(teacherId, date);
    }

    @GetMapping("/room/{roomId}/date/{date}")
    public List<Course> getCoursesByRoomAndDate(
            @PathVariable Long roomId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return courseService.getByRoomAndDate(roomId, date);
    }

    @PostMapping
    public ResponseEntity<?> createCourse(@Valid @RequestBody Course course) {
        try {
            logger.info("Création séance: matiereId={}, date={}, startTime={}, endTime={}", 
                course.getMatiereId(), course.getDate(), course.getStartTime(), course.getEndTime());
            Course created = courseService.create(course);
            logger.info("Séance créée avec ID: {}", created.getId());
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            logger.error("Erreur création séance: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Erreur: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCourse(@PathVariable Long id, @Valid @RequestBody Course course) {
        try {
            return courseService.update(id, course)
                    .map(c -> ResponseEntity.ok((Object) c))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            logger.error("Erreur mise à jour séance: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Erreur: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public CourseService.CourseStats stats() {
        return courseService.stats();
    }
}
