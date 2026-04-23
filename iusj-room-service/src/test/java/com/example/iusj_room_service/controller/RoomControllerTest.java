package com.example.iusj_room_service.controller;

import com.example.iusj_room_service.entities.Room;
import com.example.iusj_room_service.entities.RoomEquipment;
import com.example.iusj_room_service.entities.RoomReservation;
import com.example.iusj_room_service.services.RoomService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RoomController.class)
@AutoConfigureMockMvc(addFilters = false)
class RoomControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RoomService roomService;

    private Room room;

    @BeforeEach
    void setUp() {
        room = new Room();
        ReflectionTestUtils.setField(room, "id", 1L);
        ReflectionTestUtils.setField(room, "name", "A1");
        ReflectionTestUtils.setField(room, "capacity", 40);
        ReflectionTestUtils.setField(room, "type", Room.RoomType.CLASSROOM);
        ReflectionTestUtils.setField(room, "status", Room.RoomStatus.ACTIVE);
    }

    @Test
    void listRoomsShouldReturnData() throws Exception {
        when(roomService.getAll(null, null, null, null, null)).thenReturn(List.of(room));

        mockMvc.perform(get("/api/rooms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("A1"));
    }

    @Test
    void getRoomShouldReturnNotFoundWhenMissing() throws Exception {
        when(roomService.getById(1L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/rooms/1"))
                .andExpect(status().isNotFound());
    }

    @Test
    void createRoomShouldReturnOk() throws Exception {
        when(roomService.create(any(Room.class))).thenReturn(room);

        mockMvc.perform(post("/api/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"A1\",\"capacity\":40,\"type\":\"CLASSROOM\",\"status\":\"ACTIVE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void availableRoomsShouldMapDateParams() throws Exception {
        when(roomService.findAvailable(any(LocalDateTime.class), any(LocalDateTime.class), eq(20), eq(5L)))
                .thenReturn(List.of(room));

        mockMvc.perform(get("/api/rooms/available")
                        .param("start", "2026-04-25T10:00:00")
                        .param("end", "2026-04-25T12:00:00")
                        .param("minCapacity", "20")
                        .param("equipmentId", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("A1"));
    }

    @Test
    void addEquipmentShouldReturnCreated() throws Exception {
        RoomEquipment equipment = new RoomEquipment();
        ReflectionTestUtils.setField(equipment, "id", 11L);
        ReflectionTestUtils.setField(equipment, "roomId", 1L);
        ReflectionTestUtils.setField(equipment, "resourceId", 9L);
        ReflectionTestUtils.setField(equipment, "quantite", 2);
        when(roomService.addEquipment(1L, 9L, 2)).thenReturn(equipment);

        mockMvc.perform(post("/api/rooms/1/equipments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"resourceId\":9,\"quantite\":2}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.resourceId").value(9));
    }

    @Test
    void reserveShouldReturnConflictWhenServiceThrowsIllegalArgument() throws Exception {
        when(roomService.reserve(eq(1L), any())).thenThrow(new IllegalArgumentException("Room already reserved"));

        mockMvc.perform(post("/api/rooms/1/reserve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"startTime\":\"2026-04-25T10:00:00\",\"endTime\":\"2026-04-25T12:00:00\"}"))
                .andExpect(status().isConflict());
    }

    @Test
    void reserveShouldReturnCreatedWhenSuccess() throws Exception {
        RoomReservation reservation = new RoomReservation();
        ReflectionTestUtils.setField(reservation, "id", 7L);
        ReflectionTestUtils.setField(reservation, "roomId", 1L);
        ReflectionTestUtils.setField(reservation, "status", RoomReservation.Status.RESERVED);
        when(roomService.reserve(eq(1L), any())).thenReturn(reservation);

        mockMvc.perform(post("/api/rooms/1/reserve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"startTime\":\"2026-04-25T10:00:00\",\"endTime\":\"2026-04-25T12:00:00\",\"reservedByUserId\":12}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(7));
    }

    @Test
    void cancelReservationShouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/api/rooms/1/reservations/2"))
                .andExpect(status().isNoContent());

        verify(roomService).cancelReservation(1L, 2L);
    }
}
