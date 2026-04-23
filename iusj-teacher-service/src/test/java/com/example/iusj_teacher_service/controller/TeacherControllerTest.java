package com.example.iusj_teacher_service.controller;

import com.example.iusj_teacher_service.dto.TeacherRequest;
import com.example.iusj_teacher_service.entities.Teacher;
import com.example.iusj_teacher_service.services.TeacherService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TeacherController.class)
@AutoConfigureMockMvc(addFilters = false)
class TeacherControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TeacherService teacherService;

    private Teacher teacher;

    @BeforeEach
    void setUp() {
        teacher = new Teacher();
        ReflectionTestUtils.setField(teacher, "id", 1L);
        ReflectionTestUtils.setField(teacher, "userId", 10L);
        ReflectionTestUtils.setField(teacher, "specialities", Set.of("Maths"));
    }

    @Test
    void listTeachersShouldReturnTeachers() throws Exception {
        when(teacherService.getAll()).thenReturn(List.of(teacher));

        mockMvc.perform(get("/api/teachers"))
                .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].userId").value(10));
    }

    @Test
    void getTeacherShouldReturnTeacher() throws Exception {
        when(teacherService.getById(1L)).thenReturn(Optional.of(teacher));

        mockMvc.perform(get("/api/teachers/1"))
                .andExpect(status().isOk())
            .andExpect(jsonPath("$.userId").value(10));
    }

    @Test
    void getTeacherShouldReturnNotFoundWhenMissing() throws Exception {
        when(teacherService.getById(1L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/teachers/1"))
                .andExpect(status().isNotFound());
    }

    @Test
    void createTeacherShouldReturnCreatedTeacher() throws Exception {
        TeacherRequest request = new TeacherRequest();
        ReflectionTestUtils.setField(request, "userId", 10L);
        ReflectionTestUtils.setField(request, "specialities", Set.of("Maths", "Physique"));
        when(teacherService.create(eq(10L), any())).thenReturn(teacher);

        mockMvc.perform(post("/api/teachers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));

        verify(teacherService).create(eq(10L), any());
    }

    @Test
    void updateTeacherShouldReturnNotFoundWhenTeacherMissing() throws Exception {
        TeacherRequest request = new TeacherRequest();
        ReflectionTestUtils.setField(request, "userId", 10L);
        ReflectionTestUtils.setField(request, "specialities", Set.of("Physique"));
        when(teacherService.update(1L, Set.of("Physique"))).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/teachers/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteTeacherShouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/api/teachers/1"))
                .andExpect(status().isNoContent());

        verify(teacherService).delete(1L);
    }

    @Test
    void addSpecialityShouldReturnTeacher() throws Exception {
        when(teacherService.addSpeciality(1L, "Informatique")).thenReturn(Optional.of(teacher));

        mockMvc.perform(post("/api/teachers/1/specialities")
                        .param("speciality", "Informatique"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(10));
    }

    @Test
    void removeSpecialityShouldReturnTeacher() throws Exception {
        when(teacherService.removeSpeciality(1L, "Informatique")).thenReturn(Optional.of(teacher));

        mockMvc.perform(delete("/api/teachers/1/specialities")
                        .param("speciality", "Informatique"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(10));
    }

    @Test
    void getCurrentTeacherShouldReturnNotFoundWhenNull() throws Exception {
        when(teacherService.getCurrentTeacher()).thenReturn(null);

        mockMvc.perform(get("/api/teachers/current"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getTeacherByUserIdShouldReturnTeacher() throws Exception {
        when(teacherService.getByUserId(10L)).thenReturn(Optional.of(teacher));

        mockMvc.perform(get("/api/teachers/by-user/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }
}
