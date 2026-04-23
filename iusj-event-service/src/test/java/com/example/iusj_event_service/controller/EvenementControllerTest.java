package com.example.iusj_event_service.controller;

import com.example.iusj_event_service.entities.Evenement;
import com.example.iusj_event_service.services.EvenementService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

@WebMvcTest(EvenementController.class)
@AutoConfigureMockMvc(addFilters = false)
class EvenementControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EvenementService evenementService;

    private Evenement testEvent;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        testEvent = new Evenement();
        testEvent.setId(1L);
        testEvent.setNom("Reunion test");
        testEvent.setType(Evenement.EventType.REUNION);
        testEvent.setDate(LocalDate.now());
        testEvent.setHeureDebut(LocalTime.of(10, 0));
        testEvent.setDuree(60);
        testEvent.setOrganisateurId(10L);
        testEvent.setSalleId(5L);
        testEvent.setStatus(Evenement.EventStatus.PLANIFIE);
    }

    @Test
    void testGetAll() throws Exception {
        when(evenementService.getAll(any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(List.of(testEvent));

        mockMvc.perform(get("/api/events")
                .header("X-User-Role", "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nom").value("Reunion test"));
    }

    @Test
    void testGetById() throws Exception {
        when(evenementService.getById(1L)).thenReturn(testEvent);

        mockMvc.perform(get("/api/events/1")
                .header("X-User-Role", "STUDENT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nom").value("Reunion test"));
    }

    @Test
    void testCreate() throws Exception {
        when(evenementService.create(any(Evenement.class), eq(10L), eq("ADMIN"))).thenReturn(testEvent);

        mockMvc.perform(post("/api/events")
                .header("X-User-Id", "10")
                .header("X-User-Role", "ADMIN")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testEvent)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nom").value("Reunion test"));
    }

    @Test
    void testUpdate() throws Exception {
        when(evenementService.update(eq(1L), any(Evenement.class), eq(10L), eq("TEACHER"))).thenReturn(testEvent);

        mockMvc.perform(put("/api/events/1")
                .header("X-User-Id", "10")
                .header("X-User-Role", "TEACHER")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testEvent)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nom").value("Reunion test"));
    }

    @Test
    void testCancel() throws Exception {
        testEvent.setStatus(Evenement.EventStatus.ANNULE);
        when(evenementService.cancel(eq(1L), eq(10L), eq("ADMIN"))).thenReturn(testEvent);

        mockMvc.perform(put("/api/events/1/cancel")
                .header("X-User-Id", "10")
                .header("X-User-Role", "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ANNULE"));
    }

    @Test
    void testDelete() throws Exception {
        mockMvc.perform(delete("/api/events/1")
                .header("X-User-Id", "10")
                .header("X-User-Role", "ADMIN"))
                .andExpect(status().isNoContent());

        verify(evenementService).delete(1L, 10L, "ADMIN");
    }
}
