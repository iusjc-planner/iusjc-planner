package com.example.iusj_schedule_service.services;

import com.example.iusj_schedule_service.algorithm.GreedyScheduler;
import com.example.iusj_schedule_service.algorithm.TimeSlot;
import com.example.iusj_schedule_service.dto.GenerationCourseInput;
import com.example.iusj_schedule_service.dto.GenerationRequest;
import com.example.iusj_schedule_service.dto.GenerationResult;
import com.example.iusj_schedule_service.entities.EDT;
import com.example.iusj_schedule_service.entities.ScheduleEntry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anySet;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ScheduleGeneratorServiceTest {

    @Mock
    private ScheduleDataCollector dataCollector;

    @Mock
    private ScheduleService scheduleService;

    @Mock
    private EDTService edtService;

    @Mock
    private ScheduleAlgorithmFactory scheduleAlgorithmFactory;

    private ScheduleGeneratorService generatorService;

    @BeforeEach
    void setUp() {
        generatorService = new ScheduleGeneratorService(dataCollector, scheduleService, edtService, scheduleAlgorithmFactory);
    }

    @Test
    void generate_shouldMarkFixedCourseAsUnplacedWhenConflicting() {
        GenerationRequest request = new GenerationRequest();
        request.setAnnee(2026);
        request.setSemaine(12);
        request.setPeriode(EDT.PeriodeType.SEMESTRE2);
        request.setGroupIds(List.of(1L));
        request.setDryRun(false);

        GenerationCourseInput fixed = new GenerationCourseInput();
        fixed.setId(500L);
        fixed.setCourseId(500L);
        fixed.setGroupId(1L);
        fixed.setTeacherId(10L);
        fixed.setPreferredRoomId(20L);
        fixed.setFixedStartTime(LocalDateTime.of(2026, 3, 23, 8, 0));
        fixed.setFixedEndTime(LocalDateTime.of(2026, 3, 23, 10, 0));

        when(dataCollector.collectCandidates(request)).thenReturn(
                new ScheduleDataCollector.CandidateCollection(List.of(fixed), List.of(), Set.of(1L), 1)
        );
        when(dataCollector.buildWeekSlots(2026, 12)).thenReturn(List.of());
        when(dataCollector.collectRoomPool(request)).thenReturn(List.of(20L));
        when(scheduleService.validateConflicts(any(ScheduleEntry.class), eq((Long) null), any(), any()))
                .thenReturn(List.of("Room already booked for this time range"));
        when(edtService.clearEntriesForGroups(eq(2026), eq(12), anySet())).thenReturn(4L);

        EDT groupEdt = new EDT();
        groupEdt.setId(11L);
        when(edtService.getOrCreate(12, 2026, EDT.VueType.GROUPE, 1L, null)).thenReturn(groupEdt);

        GenerationResult result = generatorService.generate(request);

        assertEquals(1, result.getRequested());
        assertEquals(0, result.getPlaced());
        assertEquals(1, result.getUnplaced());
        assertTrue(result.getConflicts().stream().anyMatch(c -> c.contains("courseId=500")));
        verify(edtService).clearEntriesForGroups(eq(2026), eq(12), anySet());
        verify(scheduleAlgorithmFactory, never()).create(any());
    }

    @Test
    void generate_shouldCreateGroupTeacherAndRoomEdtsWhenPlacementSucceeds() {
        GenerationRequest request = new GenerationRequest();
        request.setAnnee(2026);
        request.setSemaine(12);
        request.setPeriode(EDT.PeriodeType.SEMESTRE2);
        request.setDryRun(false);

        GenerationCourseInput flexible = new GenerationCourseInput();
        flexible.setId(700L);
        flexible.setCourseId(700L);
        flexible.setGroupId(5L);
        flexible.setTeacherId(8L);
        flexible.setPreferredRoomId(3L);

        TimeSlot slot = new TimeSlot(LocalDateTime.of(2026, 3, 24, 10, 0), LocalDateTime.of(2026, 3, 24, 12, 0));

        when(dataCollector.collectCandidates(request)).thenReturn(
                new ScheduleDataCollector.CandidateCollection(List.of(flexible), List.of(), Set.of(5L), 1)
        );
        when(dataCollector.buildWeekSlots(2026, 12)).thenReturn(List.of(slot));
        when(dataCollector.collectRoomPool(request)).thenReturn(List.of(3L));
        when(scheduleService.validateConflicts(any(ScheduleEntry.class), eq((Long) null), any(), any())).thenReturn(List.of());
        when(scheduleAlgorithmFactory.create("GREEDY")).thenReturn(new GreedyScheduler());
        when(edtService.clearEntriesForGroups(eq(2026), eq(12), anySet())).thenReturn(0L);

        EDT groupEdt = new EDT();
        groupEdt.setId(101L);
        EDT teacherEdt = new EDT();
        teacherEdt.setId(202L);
        EDT roomEdt = new EDT();
        roomEdt.setId(303L);

        when(edtService.getOrCreate(12, 2026, EDT.VueType.GROUPE, 5L, null)).thenReturn(groupEdt);
        when(edtService.getOrCreate(12, 2026, EDT.VueType.ENSEIGNANT, 8L, null)).thenReturn(teacherEdt);
        when(edtService.getOrCreate(12, 2026, EDT.VueType.SALLE, 3L, null)).thenReturn(roomEdt);
        when(edtService.addEntry(eq(101L), any(ScheduleEntry.class))).thenAnswer(invocation -> invocation.getArgument(1));

        GenerationResult result = generatorService.generate(request);

        assertEquals(1, result.getPlaced());
        assertEquals(3, result.getEdtIds().size());
        assertTrue(result.getEdtIds().containsAll(List.of(101L, 202L, 303L)));

        ArgumentCaptor<ScheduleEntry> entryCaptor = ArgumentCaptor.forClass(ScheduleEntry.class);
        verify(edtService).addEntry(eq(101L), entryCaptor.capture());
        assertEquals(700L, entryCaptor.getValue().getCourseId());
        assertEquals(5L, entryCaptor.getValue().getGroupId());
        assertEquals(8L, entryCaptor.getValue().getTeacherId());
        assertEquals(3L, entryCaptor.getValue().getRoomId());
    }
}
