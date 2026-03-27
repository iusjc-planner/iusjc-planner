package com.example.iusj_schedule_service.services;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Comparator;

import com.example.iusj_schedule_service.client.GroupServiceClient;
import com.example.iusj_schedule_service.client.RoomServiceClient;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.example.iusj_schedule_service.entities.ScheduleEntry;
import com.example.iusj_schedule_service.repositories.ScheduleEntryRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
@Transactional
public class ScheduleService {

    private static final Logger log = LoggerFactory.getLogger(ScheduleService.class);

    private final ScheduleEntryRepository repository;
    private final GroupServiceClient groupServiceClient;
    private final RoomServiceClient roomServiceClient;

    public ScheduleService(ScheduleEntryRepository repository,
                           GroupServiceClient groupServiceClient,
                           RoomServiceClient roomServiceClient) {
        this.repository = repository;
        this.groupServiceClient = groupServiceClient;
        this.roomServiceClient = roomServiceClient;
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

        CapacityValidationResult capacityValidation = validateCapacity(entry.getRoomId(), entry.getGroupId());
        if (capacityValidation.errorMessage() != null) {
            conflicts.add(capacityValidation.errorMessage());
        }

        if (groupSize != null && roomCapacity != null && groupSize > roomCapacity) {
            conflicts.add("Room capacity conflict: group size exceeds room capacity");
        }

        return conflicts;
    }

    public ValidationFeedback validateConflictsWithWarnings(ScheduleEntry entry, Long excludeId) {
        List<String> conflicts = validateConflicts(entry, excludeId);
        List<String> warnings = new ArrayList<>();

        CapacityValidationResult capacityValidation = validateCapacity(entry.getRoomId(), entry.getGroupId());
        if (capacityValidation.warningMessage() != null) {
            warnings.add(capacityValidation.warningMessage());
        }

        return new ValidationFeedback(conflicts, warnings);
    }

    public CapacityValidationResult validateCapacity(Long roomId, Long groupId) {
        RoomServiceClient.RoomSummary room = roomServiceClient.getRoom(roomId);
        GroupServiceClient.GroupSummary group = groupServiceClient.getGroup(groupId);

        if (room == null || group == null || room.capacity() == null || group.size() == null) {
            log.warn("Capacity validation skipped due to missing room/group data. roomId={}, groupId={}", roomId, groupId);
            return new CapacityValidationResult(null, null);
        }

        int capacity = room.capacity();
        int groupSize = Math.max(group.size(), 0);

        if (groupSize > capacity) {
            String message = String.format(
                    "Capacite insuffisante : Salle %s (%d places) ne peut accueillir le groupe %s (%d etudiants)",
                    room.name() == null ? roomId : room.name(),
                    capacity,
                    group.name() == null ? groupId : group.name(),
                    groupSize
            );
            return new CapacityValidationResult(message, null);
        }

        if (groupSize > Math.floor(capacity * 0.9)) {
            String warning = String.format("Attention : capacite proche de la limite (%d/%d)", groupSize, capacity);
            return new CapacityValidationResult(null, warning);
        }

        return new CapacityValidationResult(null, null);
    }

    public List<SuggestedRoom> getSuggestedRooms(Integer effectif, LocalDateTime startTime, Integer durationMinutes) {
        if (effectif == null || effectif <= 0) {
            throw new IllegalArgumentException("effectif must be a positive number");
        }
        if (startTime == null) {
            throw new IllegalArgumentException("date/time are required");
        }
        if (durationMinutes == null || durationMinutes < 15) {
            throw new IllegalArgumentException("duration must be at least 15 minutes");
        }

        LocalDateTime endTime = startTime.plusMinutes(durationMinutes);
        List<RoomServiceClient.RoomSummary> rooms = roomServiceClient.getRoomsByMinCapacity(effectif);
        List<SuggestedRoom> suggestions = new ArrayList<>();

        for (RoomServiceClient.RoomSummary room : rooms) {
            if (room.status() != null && !"ACTIVE".equalsIgnoreCase(room.status())) {
                continue;
            }

            boolean occupied = repository.existsByRoomIdAndStatusNotAndStartTimeLessThanAndEndTimeGreaterThan(
                    room.id(),
                    ScheduleEntry.Status.CANCELLED,
                    startTime,
                    endTime
            );

            suggestions.add(new SuggestedRoom(
                    room.id(),
                    room.name(),
                    room.capacity(),
                    !occupied,
                    occupied ? "Occupee sur ce creneau" : "Disponible"
            ));
        }

        suggestions.sort(Comparator.comparing(SuggestedRoom::capacity, Comparator.nullsLast(Integer::compareTo)));
        return suggestions;
    }

    private void validateTimeRange(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null || !end.isAfter(start)) {
            throw new IllegalArgumentException("Invalid time range");
        }
    }

    public record CapacityValidationResult(String errorMessage, String warningMessage) {}

    public record ValidationFeedback(List<String> conflicts, List<String> warnings) {}

    public record SuggestedRoom(Long roomId, String roomName, Integer capacity, boolean available, String statusMessage) {}

    public record ScheduleStats(long total, long scheduled, long completed, long cancelled) {}
}
