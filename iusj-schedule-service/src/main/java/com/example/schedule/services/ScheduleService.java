package com.example.schedule.services;

import java.time.LocalDateTime;
import java.util.List;
import java.nio.charset.StandardCharsets;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.example.schedule.entities.ScheduleEntry;
import com.example.schedule.entities.SessionStatus;
import com.example.schedule.repositories.ScheduleEntryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleEntryRepository repository;

    public List<ScheduleEntry> findAll(
        String courseId,
        String teacherId,
        String roomId,
        String groupId,
        SessionStatus status,
        LocalDateTime startFrom,
        LocalDateTime endTo
    ) {
        Specification<ScheduleEntry> spec = ScheduleSpecifications.filter(
            courseId,
            teacherId,
            roomId,
            groupId,
            status,
            startFrom,
            endTo
        );
        return repository.findAll(spec, Sort.by("startTime").ascending());
    }

    public ScheduleEntry findById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public ScheduleEntry create(ScheduleEntry entry) {
        validateTimeRange(entry);
        checkConflicts(entry, null);
        return repository.save(entry);
    }

    public ScheduleEntry update(Long id, ScheduleEntry updated) {
        validateTimeRange(updated);
        ScheduleEntry existing = repository.findById(id).orElse(null);
        if (existing == null) {
            return null;
        }
        updated.setId(existing.getId());
        checkConflicts(updated, existing.getId());
        return repository.save(updated);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public ScheduleStats stats() {
        long total = repository.count();
        long scheduled = repository.countByStatus(SessionStatus.SCHEDULED);
        long completed = repository.countByStatus(SessionStatus.COMPLETED);
        long cancelled = repository.countByStatus(SessionStatus.CANCELLED);
        return new ScheduleStats(total, scheduled, completed, cancelled);
    }

    public record GenerationResult(String message) {}

    public GenerationResult generateAuto() {
        // Stub: replace with real generation algorithm
        return new GenerationResult("Auto-generation stub: aucun changement appliqué");
    }

    public ResponseEntity<byte[]> exportPdfStub(Long id) {
        String payload = "PDF export stub for schedule " + id;
        byte[] bytes = payload.getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=schedule-" + id + ".pdf")
                .body(bytes);
    }

    public ResponseEntity<byte[]> exportExcelStub(Long id) {
        String payload = "Excel export stub for schedule " + id;
        byte[] bytes = payload.getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=schedule-" + id + ".xlsx")
                .body(bytes);
    }

    public record ScheduleStats(long total, long scheduled, long completed, long cancelled) {}

    private void validateTimeRange(ScheduleEntry entry) {
        LocalDateTime start = entry.getStartTime();
        LocalDateTime end = entry.getEndTime();
        if (start == null || end == null || !end.isAfter(start)) {
            throw new IllegalArgumentException("End time must be after start time");
        }
    }

    private void checkConflicts(ScheduleEntry entry, Long excludeId) {
        Specification<ScheduleEntry> roomOverlap = ScheduleSpecifications.overlapFor(
            "roomId", entry.getRoomId(), entry.getStartTime(), entry.getEndTime(), excludeId
        );
        Specification<ScheduleEntry> teacherOverlap = ScheduleSpecifications.overlapFor(
            "teacherId", entry.getTeacherId(), entry.getStartTime(), entry.getEndTime(), excludeId
        );
        Specification<ScheduleEntry> groupOverlap = ScheduleSpecifications.overlapFor(
            "groupId", entry.getGroupId(), entry.getStartTime(), entry.getEndTime(), excludeId
        );

        long conflicts = repository.count(roomOverlap) + repository.count(teacherOverlap) + repository.count(groupOverlap);
        if (conflicts > 0) {
            throw new IllegalArgumentException("Schedule conflict detected for room/teacher/group at the given time");
        }
    }
}
