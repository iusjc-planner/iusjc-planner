package com.example.iusj_schedule_service.services;

import com.example.iusj_schedule_service.client.GroupServiceClient;
import com.example.iusj_schedule_service.client.RoomServiceClient;
import com.example.iusj_schedule_service.entities.ScheduleEntry;
import com.example.iusj_schedule_service.repositories.ScheduleEntryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ScheduleServiceTest {

    @Mock
    private ScheduleEntryRepository repository;

    @Mock
    private GroupServiceClient groupServiceClient;

    @Mock
    private RoomServiceClient roomServiceClient;

    @InjectMocks
    private ScheduleService service;

    private ScheduleEntry entry;

    @BeforeEach
    void setUp() {
        entry = new ScheduleEntry();
        entry.setId(1L);
        entry.setCourseId(100L);
        entry.setTeacherId(200L);
        entry.setRoomId(300L);
        entry.setGroupId(400L);
        entry.setStartTime(LocalDateTime.of(2026, 3, 25, 10, 0));
        entry.setEndTime(LocalDateTime.of(2026, 3, 25, 12, 0));
        entry.setStatus(ScheduleEntry.Status.SCHEDULED);
    }

    private void stubNoConflictChecksForExcludeId() {
        when(repository.existsByRoomIdAndStatusNotAndStartTimeLessThanAndEndTimeGreaterThanAndIdNot(300L, ScheduleEntry.Status.CANCELLED, entry.getStartTime(), entry.getEndTime(), 1L))
                .thenReturn(false);
        when(repository.existsByTeacherIdAndStatusNotAndStartTimeLessThanAndEndTimeGreaterThanAndIdNot(200L, ScheduleEntry.Status.CANCELLED, entry.getStartTime(), entry.getEndTime(), 1L))
                .thenReturn(false);
        when(repository.existsByGroupIdAndStatusNotAndStartTimeLessThanAndEndTimeGreaterThanAndIdNot(400L, ScheduleEntry.Status.CANCELLED, entry.getStartTime(), entry.getEndTime(), 1L))
                .thenReturn(false);
    }

    @Test
    void validateConflicts_ShouldReturnCapacityError_WhenGroupTooLarge() {
                stubNoConflictChecksForExcludeId();
        when(roomServiceClient.getRoom(300L)).thenReturn(new RoomServiceClient.RoomSummary(300L, "A101", 30, "ACTIVE"));
        when(groupServiceClient.getGroup(400L)).thenReturn(new GroupServiceClient.GroupSummary(400L, "L2 Info", 60));

        List<String> conflicts = service.validateConflicts(entry, 1L);

        assertFalse(conflicts.isEmpty());
        assertTrue(conflicts.get(0).contains("Capacite insuffisante"));
    }

    @Test
    void validateConflictsWithWarnings_ShouldReturnCapacityWarning_WhenNearLimit() {
                stubNoConflictChecksForExcludeId();
        when(roomServiceClient.getRoom(300L)).thenReturn(new RoomServiceClient.RoomSummary(300L, "B202", 60, "ACTIVE"));
        when(groupServiceClient.getGroup(400L)).thenReturn(new GroupServiceClient.GroupSummary(400L, "L2 Info", 55));

        ScheduleService.ValidationFeedback feedback = service.validateConflictsWithWarnings(entry, 1L);

        assertTrue(feedback.conflicts().isEmpty());
        assertEquals(1, feedback.warnings().size());
        assertTrue(feedback.warnings().get(0).contains("capacite proche"));
    }

    @Test
    void getSuggestedRooms_ShouldSortByCapacityAndMarkAvailability() {
        when(roomServiceClient.getRoomsByMinCapacity(50)).thenReturn(List.of(
                new RoomServiceClient.RoomSummary(2L, "Amphi A", 150, "ACTIVE"),
                new RoomServiceClient.RoomSummary(3L, "Salle B", 80, "ACTIVE")
        ));
        when(repository.existsByRoomIdAndStatusNotAndStartTimeLessThanAndEndTimeGreaterThan(2L, ScheduleEntry.Status.CANCELLED,
                LocalDateTime.of(2026, 3, 26, 14, 0),
                LocalDateTime.of(2026, 3, 26, 16, 0))).thenReturn(false);
        when(repository.existsByRoomIdAndStatusNotAndStartTimeLessThanAndEndTimeGreaterThan(3L, ScheduleEntry.Status.CANCELLED,
                LocalDateTime.of(2026, 3, 26, 14, 0),
                LocalDateTime.of(2026, 3, 26, 16, 0))).thenReturn(true);

        List<ScheduleService.SuggestedRoom> suggestions = service.getSuggestedRooms(
                50,
                LocalDateTime.of(2026, 3, 26, 14, 0),
                120
        );

        assertEquals(2, suggestions.size());
        assertEquals(80, suggestions.get(0).capacity());
        assertFalse(suggestions.get(0).available());
        assertEquals(150, suggestions.get(1).capacity());
        assertTrue(suggestions.get(1).available());
    }
}
