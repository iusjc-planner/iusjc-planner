package com.example.iusj_schedule_service.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

import com.example.iusj_schedule_service.entities.ScheduleEntry;
import com.example.iusj_schedule_service.services.ScheduleService;

@WebMvcTest(ScheduleController.class)
@AutoConfigureMockMvc(addFilters = false)
class ScheduleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ScheduleService service;

    @Test
    void listShouldReturnEntries() throws Exception {
        ScheduleEntry entry = buildEntry(1L);
        when(service.getAll(null, null, null, null, null, null, null)).thenReturn(List.of(entry));

        mockMvc.perform(get("/api/schedule"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));
    }

    @Test
    void getShouldReturnNotFoundWhenMissing() throws Exception {
        when(service.getById(404L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/schedule/404"))
                .andExpect(status().isNotFound());
    }

    @Test
    void createShouldReturnConflictOnBusinessConflict() throws Exception {
        when(service.create(any(ScheduleEntry.class))).thenThrow(new IllegalArgumentException("conflict"));

        mockMvc.perform(post("/api/schedule")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "courseId": 100,
                                  "teacherId": 200,
                                  "roomId": 300,
                                  "groupId": 400,
                                  "startTime": "2026-05-10T09:00:00",
                                  "endTime": "2026-05-10T11:00:00"
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(content().string("conflict"));
    }

    @Test
    void updateShouldReturnNotFoundWhenMissing() throws Exception {
        when(service.update(eq(9L), any(ScheduleEntry.class))).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/schedule/9")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "courseId": 100,
                                  "teacherId": 200,
                                  "roomId": 300,
                                  "groupId": 400,
                                  "startTime": "2026-05-10T09:00:00",
                                  "endTime": "2026-05-10T11:00:00"
                                }
                                """))
                .andExpect(status().isNotFound());
    }

    @Test
    void validateShouldReturnConflictAndWarningsPayload() throws Exception {
        when(service.validateConflictsWithWarnings(any(ScheduleEntry.class), eq(null)))
                .thenReturn(new ScheduleService.ValidationFeedback(List.of("Room already booked"), List.of("warning")));

        mockMvc.perform(post("/api/schedule/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "courseId": 100,
                                  "teacherId": 200,
                                  "roomId": 300,
                                  "groupId": 400,
                                  "startTime": "2026-05-10T09:00:00",
                                  "endTime": "2026-05-10T11:00:00"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.conflict").value(true))
                .andExpect(jsonPath("$.reasons[0]").value("Room already booked"))
                .andExpect(jsonPath("$.warnings[0]").value("warning"));
    }

    @Test
    void statsShouldReturnAggregates() throws Exception {
        when(service.stats()).thenReturn(new ScheduleService.ScheduleStats(20, 14, 3, 3));

        mockMvc.perform(get("/api/schedule/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(20))
                .andExpect(jsonPath("$.scheduled").value(14));
    }

                @Test
                void suggestRoomsShouldReturnBadRequestOnInvalidInput() throws Exception {
              when(service.getSuggestedRooms(eq(0), any(LocalDateTime.class), eq(10)))
                .thenThrow(new IllegalArgumentException("effectif must be a positive number"));

              mockMvc.perform(get("/api/schedule/suggest-rooms")
                  .param("effectif", "0")
                  .param("date", "2026-05-10")
                  .param("time", "09:00:00")
                  .param("duration", "10"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("effectif must be a positive number"));
                }

                @Test
                void validateCapacityShouldExposeValidAndWarningFlags() throws Exception {
              when(service.validateCapacity(300L, 400L))
                .thenReturn(new ScheduleService.CapacityValidationResult(null, "Attention : capacite proche"));

              mockMvc.perform(get("/api/schedule/validate-capacity")
                  .param("roomId", "300")
                  .param("groupId", "400"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true))
                .andExpect(jsonPath("$.error").doesNotExist())
                .andExpect(jsonPath("$.warning").value("Attention : capacite proche"));
                }

    private ScheduleEntry buildEntry(Long id) {
        ScheduleEntry entry = new ScheduleEntry();
        ReflectionTestUtils.setField(entry, "id", id);
        ReflectionTestUtils.setField(entry, "courseId", 100L);
        ReflectionTestUtils.setField(entry, "teacherId", 200L);
        ReflectionTestUtils.setField(entry, "roomId", 300L);
        ReflectionTestUtils.setField(entry, "groupId", 400L);
        ReflectionTestUtils.setField(entry, "startTime", LocalDateTime.of(2026, 5, 10, 9, 0));
        ReflectionTestUtils.setField(entry, "endTime", LocalDateTime.of(2026, 5, 10, 11, 0));
        ReflectionTestUtils.setField(entry, "status", ScheduleEntry.Status.SCHEDULED);
        return entry;
    }
}
