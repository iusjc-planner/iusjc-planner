package com.example.iusj_schedule_service.repositories;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.example.iusj_schedule_service.entities.ScheduleEntry;

public interface ScheduleEntryRepository extends JpaRepository<ScheduleEntry, Long>, JpaSpecificationExecutor<ScheduleEntry> {

        List<ScheduleEntry> findByEdt_IdOrderByStartTimeAsc(Long edtId);

        List<ScheduleEntry> findByGroupIdAndStartTimeBetweenOrderByStartTimeAsc(Long groupId, LocalDateTime start, LocalDateTime end);

        List<ScheduleEntry> findByTeacherIdAndStartTimeBetweenOrderByStartTimeAsc(Long teacherId, LocalDateTime start, LocalDateTime end);

        List<ScheduleEntry> findByRoomIdAndStartTimeBetweenOrderByStartTimeAsc(Long roomId, LocalDateTime start, LocalDateTime end);

    long countByStatus(ScheduleEntry.Status status);

    boolean existsByRoomIdAndStatusNotAndStartTimeLessThanAndEndTimeGreaterThan(
            Long roomId, ScheduleEntry.Status status, java.time.LocalDateTime startTime, java.time.LocalDateTime endTime);

    boolean existsByTeacherIdAndStatusNotAndStartTimeLessThanAndEndTimeGreaterThan(
            Long teacherId, ScheduleEntry.Status status, java.time.LocalDateTime startTime, java.time.LocalDateTime endTime);

    boolean existsByGroupIdAndStatusNotAndStartTimeLessThanAndEndTimeGreaterThan(
            Long groupId, ScheduleEntry.Status status, java.time.LocalDateTime startTime, java.time.LocalDateTime endTime);

    boolean existsByRoomIdAndStatusNotAndStartTimeLessThanAndEndTimeGreaterThanAndIdNot(
            Long roomId, ScheduleEntry.Status status, java.time.LocalDateTime startTime, java.time.LocalDateTime endTime, Long id);

    boolean existsByTeacherIdAndStatusNotAndStartTimeLessThanAndEndTimeGreaterThanAndIdNot(
            Long teacherId, ScheduleEntry.Status status, java.time.LocalDateTime startTime, java.time.LocalDateTime endTime, Long id);

    boolean existsByGroupIdAndStatusNotAndStartTimeLessThanAndEndTimeGreaterThanAndIdNot(
            Long groupId, ScheduleEntry.Status status, java.time.LocalDateTime startTime, java.time.LocalDateTime endTime, Long id);
}
