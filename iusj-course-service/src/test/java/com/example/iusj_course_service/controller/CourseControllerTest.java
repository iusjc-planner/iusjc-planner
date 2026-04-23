package com.example.iusj_course_service.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.util.ReflectionTestUtils;

import com.example.iusj_course_service.entities.Course;
import com.example.iusj_course_service.services.CourseService;

@WebMvcTest(CourseController.class)
@AutoConfigureMockMvc(addFilters = false)
class CourseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CourseService courseService;

    @Test
    void getCourseShouldReturnNotFoundWhenMissing() throws Exception {
        when(courseService.getById(404L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/courses/404"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getCourseShouldReturnCourseWhenFound() throws Exception {
        Course course = buildCourse(1L, 12L, "Algorithmique");
        when(courseService.getById(1L)).thenReturn(Optional.of(course));

        mockMvc.perform(get("/api/courses/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Algorithmique"));
    }

    @Test
    void listCoursesShouldForwardFilters() throws Exception {
        Course course = buildCourse(2L, 13L, "Reseaux");
        when(courseService.getAll(eq(13L), eq(Course.CourseStatus.SCHEDULED), eq(Course.CourseType.TD),
                eq(5L), eq(7L), eq(9L), eq(LocalDate.of(2026, 5, 1)), eq(LocalDate.of(2026, 5, 15))))
                .thenReturn(List.of(course));

        mockMvc.perform(get("/api/courses")
                        .param("matiereId", "13")
                        .param("status", "SCHEDULED")
                        .param("type", "TD")
                        .param("teacherId", "5")
                        .param("roomId", "7")
                        .param("groupId", "9")
                        .param("dateFrom", "2026-05-01")
                        .param("dateTo", "2026-05-15"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(2));
    }

          @Test
          void getCoursesBySchoolShouldReturnList() throws Exception {
            Course course = buildCourse(8L, 21L, "Bases de donnees");
            when(courseService.getBySchool(3L)).thenReturn(List.of(course));

            mockMvc.perform(get("/api/courses/school/3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(8))
                .andExpect(jsonPath("$[0].title").value("Bases de donnees"));
          }

          @Test
          void getCoursesBySchoolAndFiliereShouldReturnList() throws Exception {
            Course course = buildCourse(9L, 22L, "Genie logiciel");
            when(courseService.getBySchoolAndFiliere(3L, 4L)).thenReturn(List.of(course));

            mockMvc.perform(get("/api/courses/school/3/filiere/4"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(9))
                .andExpect(jsonPath("$[0].title").value("Genie logiciel"));
          }

    @Test
    void createCourseShouldReturnSavedCourse() throws Exception {
        Course created = buildCourse(33L, 17L, "POO");
        when(courseService.create(any(Course.class))).thenReturn(created);

        mockMvc.perform(post("/api/courses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "matiereId": 17,
                                  "date": "2026-05-10",
                                  "startTime": "09:00",
                                  "endTime": "11:00",
                                  "type": "CM"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(33))
                .andExpect(jsonPath("$.title").value("POO"));
    }

    @Test
    void createCourseShouldReturn500OnServiceFailure() throws Exception {
        when(courseService.create(any(Course.class))).thenThrow(new IllegalStateException("boom"));

        mockMvc.perform(post("/api/courses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "matiereId": 17,
                                  "date": "2026-05-10",
                                  "startTime": "09:00",
                                  "endTime": "11:00"
                                }
                                """))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Erreur: boom")));
    }

    @Test
    void updateCourseShouldReturnNotFoundWhenIdUnknown() throws Exception {
        when(courseService.update(eq(999L), any(Course.class))).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/courses/999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "matiereId": 11,
                                  "date": "2026-05-10",
                                  "startTime": "09:00",
                                  "endTime": "11:00"
                                }
                                """))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateCourseShouldReturn500OnFailure() throws Exception {
        when(courseService.update(eq(44L), any(Course.class))).thenThrow(new RuntimeException("update failed"));

        mockMvc.perform(put("/api/courses/44")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "matiereId": 11,
                                  "date": "2026-05-10",
                                  "startTime": "09:00",
                                  "endTime": "11:00"
                                }
                                """))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Erreur: update failed")));
    }

    @Test
    void deleteCourseShouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/api/courses/7"))
                .andExpect(status().isNoContent());
    }

    @Test
    void statsShouldReturnAggregates() throws Exception {
        when(courseService.stats()).thenReturn(new CourseService.CourseStats(15, 8, 5, 2));

        mockMvc.perform(get("/api/courses/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(15))
                .andExpect(jsonPath("$.scheduled").value(8))
                .andExpect(jsonPath("$.completed").value(5))
                .andExpect(jsonPath("$.cancelled").value(2));
    }

          @Test
          void getPrerequisitesShouldReturnList() throws Exception {
            Course prerequisite = buildCourse(77L, 44L, "Structures de donnees");
            when(courseService.getPrerequisites(12L)).thenReturn(List.of(prerequisite));

            mockMvc.perform(get("/api/courses/12/prerequisites"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(77))
                .andExpect(jsonPath("$[0].title").value("Structures de donnees"));
          }

          @Test
          void updatePrerequisitesShouldReturnBadRequestOnInvalidSelfReference() throws Exception {
            when(courseService.updatePrerequisites(eq(12L), any())).thenThrow(new IllegalArgumentException("self"));

            mockMvc.perform(put("/api/courses/12/prerequisites")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("[12, 13]"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Erreur: self")));
          }

    private Course buildCourse(Long id, Long matiereId, String title) {
        Course course = new Course();
        ReflectionTestUtils.setField(course, "id", id);
        ReflectionTestUtils.setField(course, "matiereId", matiereId);
        ReflectionTestUtils.setField(course, "title", title);
        ReflectionTestUtils.setField(course, "date", LocalDate.of(2026, 5, 10));
        ReflectionTestUtils.setField(course, "startTime", LocalTime.of(9, 0));
        ReflectionTestUtils.setField(course, "endTime", LocalTime.of(11, 0));
        ReflectionTestUtils.setField(course, "status", Course.CourseStatus.SCHEDULED);
        ReflectionTestUtils.setField(course, "type", Course.CourseType.CM);
        return course;
    }
}
