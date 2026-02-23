package com.example.iusj_schedule_service.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.example.iusj_schedule_service.entities.ScheduleEntry;

public interface ScheduleEntryRepository extends JpaRepository<ScheduleEntry, Long>, JpaSpecificationExecutor<ScheduleEntry> {

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
