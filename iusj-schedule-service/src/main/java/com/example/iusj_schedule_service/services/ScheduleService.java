package com.example.iusj_schedule_service.services;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.iusj_schedule_service.entities.ScheduleEntry;
import com.example.iusj_schedule_service.repositories.ScheduleEntryRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
@Transactional
public class ScheduleService {

    private final ScheduleEntryRepository repository;

    public ScheduleService(ScheduleEntryRepository repository) {
        this.repository = repository;
    }

    public List<ScheduleEntry> getAll(Long courseId, Long teacherId, Long roomId, Long groupId,
                                      ScheduleEntry.Status status, LocalDateTime startFrom, LocalDateTime endTo) {
        Specification<ScheduleEntry> spec = ScheduleSpecifications.withFilters(
                courseId, teacherId, roomId, groupId, status, startFrom, endTo);
        return repository.findAll(spec, Sort.by(Sort.Direction.ASC, "startTime"));
    }

    public Optional<ScheduleEntry> getById(Long id) {
        return repository.findById(id);
    }

    public ScheduleEntry create(ScheduleEntry entry) {
        validateTimeRange(entry.getStartTime(), entry.getEndTime());
        List<String> conflicts = validateConflicts(entry, null);
        if (!conflicts.isEmpty()) {
            throw new IllegalArgumentException(String.join("; ", conflicts));
        }
        return repository.save(entry);
    }

    public Optional<ScheduleEntry> update(Long id, ScheduleEntry entry) {
        return repository.findById(id).map(existing -> {
            validateTimeRange(entry.getStartTime(), entry.getEndTime());
            List<String> conflicts = validateConflicts(entry, id);
            if (!conflicts.isEmpty()) {
                throw new IllegalArgumentException(String.join("; ", conflicts));
            }
            entry.setId(id);
            return repository.save(entry);
        });
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Schedule entry not found with id " + id);
        }
        repository.deleteById(id);
    }

    public ScheduleStats stats() {
        long total = repository.count();
        long scheduled = repository.countByStatus(ScheduleEntry.Status.SCHEDULED);
        long completed = repository.countByStatus(ScheduleEntry.Status.COMPLETED);
        long cancelled = repository.countByStatus(ScheduleEntry.Status.CANCELLED);
        return new ScheduleStats(total, scheduled, completed, cancelled);
    }

    public List<String> validateConflicts(ScheduleEntry entry, Long excludeId) {
        return validateConflicts(entry, excludeId, null, null);
    }

    public List<String> validateConflicts(ScheduleEntry entry, Long excludeId, Integer groupSize, Integer roomCapacity) {
        List<String> conflicts = new ArrayList<>();
        boolean roomConflict = excludeId == null
                ? repository.existsByRoomIdAndStatusNotAndStartTimeLessThanAndEndTimeGreaterThan(
                    entry.getRoomId(), ScheduleEntry.Status.CANCELLED, entry.getStartTime(), entry.getEndTime())
                : repository.existsByRoomIdAndStatusNotAndStartTimeLessThanAndEndTimeGreaterThanAndIdNot(
                    entry.getRoomId(), ScheduleEntry.Status.CANCELLED, entry.getStartTime(), entry.getEndTime(), excludeId);

        boolean teacherConflict = excludeId == null
                ? repository.existsByTeacherIdAndStatusNotAndStartTimeLessThanAndEndTimeGreaterThan(
                    entry.getTeacherId(), ScheduleEntry.Status.CANCELLED, entry.getStartTime(), entry.getEndTime())
                : repository.existsByTeacherIdAndStatusNotAndStartTimeLessThanAndEndTimeGreaterThanAndIdNot(
                    entry.getTeacherId(), ScheduleEntry.Status.CANCELLED, entry.getStartTime(), entry.getEndTime(), excludeId);

        boolean groupConflict = excludeId == null
                ? repository.existsByGroupIdAndStatusNotAndStartTimeLessThanAndEndTimeGreaterThan(
                    entry.getGroupId(), ScheduleEntry.Status.CANCELLED, entry.getStartTime(), entry.getEndTime())
                : repository.existsByGroupIdAndStatusNotAndStartTimeLessThanAndEndTimeGreaterThanAndIdNot(
                    entry.getGroupId(), ScheduleEntry.Status.CANCELLED, entry.getStartTime(), entry.getEndTime(), excludeId);

        if (roomConflict) {
            conflicts.add("Room already booked for this time range");
        }
        if (teacherConflict) {
            conflicts.add("Teacher already booked for this time range");
        }
        if (groupConflict) {
            conflicts.add("Group already booked for this time range");
        }

        if (groupSize != null && roomCapacity != null && groupSize > roomCapacity) {
            conflicts.add("Room capacity conflict: group size exceeds room capacity");
        }

        return conflicts;
    }

    private void validateTimeRange(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null || !end.isAfter(start)) {
            throw new IllegalArgumentException("Invalid time range");
        }
    }

    public record ScheduleStats(long total, long scheduled, long completed, long cancelled) {}
}
