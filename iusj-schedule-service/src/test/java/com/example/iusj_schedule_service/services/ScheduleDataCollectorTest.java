package com.example.iusj_schedule_service.services;

import com.example.iusj_schedule_service.client.CourseCatalogClient;
import com.example.iusj_schedule_service.dto.GenerationCourseInput;
import com.example.iusj_schedule_service.dto.GenerationRequest;
import com.example.iusj_schedule_service.entities.EDT;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ScheduleDataCollectorTest {

    @Mock
    private RoomServiceClient roomServiceClient;

    @Mock
    private CourseCatalogClient courseCatalogClient;

    private ScheduleDataCollector collector;

    @BeforeEach
    void setUp() {
        collector = new ScheduleDataCollector(roomServiceClient, courseCatalogClient);
    }

    @Test
    void collectCandidates_shouldLoadFromCoursesAndFallbackTeacherFromMatiere() {
        GenerationRequest request = new GenerationRequest();
        request.setAnnee(2026);
        request.setSemaine(12);
        request.setPeriode(EDT.PeriodeType.SEMESTRE2);

        CourseCatalogClient.CourseSummary c1 = new CourseCatalogClient.CourseSummary(
                101L, 11L, "CM", "Machine Learning",
                LocalDate.of(2026, 3, 23), LocalTime.of(8, 0), LocalTime.of(10, 0),
                5L, 7L, null, "SCHEDULED"
        );
        CourseCatalogClient.CourseSummary c2 = new CourseCatalogClient.CourseSummary(
                102L, 12L, "TD", "Compilation",
                LocalDate.of(2026, 3, 24), LocalTime.of(10, 0), LocalTime.of(12, 0),
                6L, 8L, null, "POSTPONED"
        );

        when(courseCatalogClient.getCoursesByDateRange(any(), any(), any())).thenReturn(List.of(c1, c2));
        when(courseCatalogClient.getMatiere(11L)).thenReturn(new CourseCatalogClient.MatiereSummary(11L, "ISI4177", "IA", 501L));
        when(courseCatalogClient.getMatiere(12L)).thenReturn(new CourseCatalogClient.MatiereSummary(12L, "ISI4178", "Compil", null));

        ScheduleDataCollector.CandidateCollection result = collector.collectCandidates(request);

        assertEquals(2, result.requestedCount());
        assertEquals(1, result.candidates().size());
        assertEquals(1, result.rejected().size());
        assertTrue(result.rejected().get(0).contains("courseId=102"));
        assertTrue(result.discoveredGroupIds().contains(7L));

        GenerationCourseInput candidate = result.candidates().get(0);
        assertEquals(501L, candidate.getTeacherId());
        assertEquals(101L, candidate.getCourseId());
        assertEquals(7L, candidate.getGroupId());
        assertNotNull(candidate.getFixedStartTime());
        assertNotNull(candidate.getFixedEndTime());

        ArgumentCaptor<List> statusesCaptor = ArgumentCaptor.forClass(List.class);
        verify(courseCatalogClient).getCoursesByDateRange(any(), any(), statusesCaptor.capture());
        @SuppressWarnings("unchecked")
        List<String> statuses = statusesCaptor.getValue();
        assertTrue(statuses.contains("SCHEDULED"));
        assertTrue(statuses.contains("POSTPONED"));
    }

    @Test
    void collectCandidates_shouldPrioritizeManualEntriesWhenProvided() {
        GenerationRequest request = new GenerationRequest();
        request.setAnnee(2026);
        request.setSemaine(12);
        request.setPeriode(EDT.PeriodeType.SEMESTRE2);
        request.setGroupIds(List.of(77L));

        GenerationCourseInput manual = new GenerationCourseInput();
        manual.setCourseId(999L);
        manual.setGroupId(77L);
        manual.setTeacherId(88L);
        request.setEntries(List.of(manual));

        ScheduleDataCollector.CandidateCollection result = collector.collectCandidates(request);

        assertEquals(1, result.candidates().size());
        assertEquals(1, result.requestedCount());
        assertTrue(result.rejected().isEmpty());
        assertFalse(result.discoveredGroupIds().isEmpty());
        verify(courseCatalogClient, never()).getCoursesByDateRange(any(), any(), eq(List.of("SCHEDULED", "POSTPONED")));
    }
}
