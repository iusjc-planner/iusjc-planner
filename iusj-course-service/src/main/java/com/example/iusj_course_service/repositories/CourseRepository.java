package com.example.iusj_course_service.repositories;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.example.iusj_course_service.entities.Course;

public interface CourseRepository extends JpaRepository<Course, Long>, JpaSpecificationExecutor<Course> {

    List<Course> findByMatiereId(Long matiereId);

    List<Course> findByDate(LocalDate date);

    List<Course> findByDateBetween(LocalDate startDate, LocalDate endDate);

    List<Course> findByTeacherId(Long teacherId);

    List<Course> findByTeacherIdAndDate(Long teacherId, LocalDate date);

    List<Course> findByRoomId(Long roomId);

    List<Course> findByRoomIdAndDate(Long roomId, LocalDate date);

    List<Course> findByGroupId(Long groupId);

    List<Course> findByStatus(Course.CourseStatus status);

    long countByStatus(Course.CourseStatus status);
}
