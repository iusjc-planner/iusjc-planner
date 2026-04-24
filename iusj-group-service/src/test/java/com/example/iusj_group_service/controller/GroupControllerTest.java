package com.example.iusj_group_service.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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

import com.example.iusj_group_service.entities.Group;
import com.example.iusj_group_service.services.GroupService;

@WebMvcTest(GroupController.class)
@AutoConfigureMockMvc(addFilters = false)
class GroupControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GroupService service;

    @Test
    void listShouldReturnGroups() throws Exception {
        Group group = buildGroup(1L, "L1 A");
        when(service.getAll(null, null, null, null, null)).thenReturn(List.of(group));

        mockMvc.perform(get("/api/groups"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("L1 A"));
    }

    @Test
    void getShouldReturnNotFoundWhenMissing() throws Exception {
        when(service.getById(404L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/groups/404"))
                .andExpect(status().isNotFound());
    }

    @Test
    void splitShouldReturnBadRequestOnValidationError() throws Exception {
        when(service.split(eq(1L), eq(2), eq(Group.GroupType.TP))).thenThrow(new IllegalArgumentException("invalid"));

        mockMvc.perform(post("/api/groups/1/split")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "count": 2,
                                  "type": "TP"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void splitShouldReturnCreatedSubgroups() throws Exception {
        Group subgroup = buildGroup(2L, "L1 A - TD1");
        when(service.split(eq(1L), eq(2), eq(Group.GroupType.TD))).thenReturn(List.of(subgroup));

        mockMvc.perform(post("/api/groups/1/split")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "count": 2,
                                  "type": "TD"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(2));
    }

    @Test
    void statsShouldReturnAggregates() throws Exception {
        when(service.stats()).thenReturn(new GroupService.GroupStats(10, 8, 2));

        mockMvc.perform(get("/api/groups/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(10))
                .andExpect(jsonPath("$.active").value(8))
                .andExpect(jsonPath("$.inactive").value(2));
    }

    @Test
    void deleteShouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/api/groups/1"))
                .andExpect(status().isNoContent());
    }

    private Group buildGroup(Long id, String name) {
        Group group = new Group();
        ReflectionTestUtils.setField(group, "id", id);
        ReflectionTestUtils.setField(group, "name", name);
        ReflectionTestUtils.setField(group, "filiereId", 10L);
        ReflectionTestUtils.setField(group, "status", Group.Status.ACTIVE);
        ReflectionTestUtils.setField(group, "groupType", Group.GroupType.PRINCIPAL);
        return group;
    }
}
