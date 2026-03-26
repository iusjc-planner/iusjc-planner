package com.example.iusj_notification_service.controller;

import com.example.iusj_notification_service.dto.BroadcastRequest;
import com.example.iusj_notification_service.entities.Notification;
import com.example.iusj_notification_service.entities.NotificationType;
import com.example.iusj_notification_service.services.NotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(NotificationController.class)
@AutoConfigureMockMvc(addFilters = false)
class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private NotificationService notificationService;

    @Test
    void getAllShouldReturnNotificationsForCurrentUser() throws Exception {
        Notification notification = new Notification();
        notification.setId(10L);
        notification.setUserId(1L);
        notification.setType(NotificationType.INFO);
        notification.setContenu("Test notification");
        notification.setDateEnvoi(LocalDateTime.now());
        notification.setLu(false);

        when(notificationService.getAll(1L)).thenReturn(List.of(notification));

        mockMvc.perform(get("/api/notifications")
                .header("X-User-Id", "1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(10))
            .andExpect(jsonPath("$[0].userId").value(1));
    }

    @Test
    void createShouldReturnForbiddenForNonAdmin() throws Exception {
        Notification payload = new Notification();
        payload.setType(NotificationType.INFO);
        payload.setContenu("Message");
        payload.setUserId(2L);
        payload.setDateEnvoi(LocalDateTime.now());
        payload.setLu(false);

        mockMvc.perform(post("/api/notifications")
                .contentType(MediaType.APPLICATION_JSON)
                .header("X-User-Role", "ENSEIGNANT")
                .content(objectMapper.writeValueAsString(payload)))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.error").value("Acces refuse - Role ADMIN requis"));
    }

            @Test
            void unreadCountAliasShouldReturnCount() throws Exception {
            when(notificationService.getUnreadCount(1L)).thenReturn(3L);

            mockMvc.perform(get("/api/notifications/unread-count")
                .header("X-User-Id", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(3));
            }

    @Test
    void broadcastShouldReturnCreatedForAdmin() throws Exception {
        BroadcastRequest request = new BroadcastRequest();
        request.setType(NotificationType.ALERT);
        request.setContenu("Broadcast");
        request.setUserIds(List.of(1L, 2L));

        Notification created = new Notification();
        created.setId(20L);
        created.setUserId(1L);
        created.setType(NotificationType.ALERT);
        created.setContenu("Broadcast");
        created.setDateEnvoi(LocalDateTime.now());
        created.setLu(false);

        when(notificationService.broadcast(ArgumentMatchers.any(Notification.class), ArgumentMatchers.eq(List.of(1L, 2L))))
            .thenReturn(List.of(created));

        mockMvc.perform(post("/api/notifications/broadcast")
                .contentType(MediaType.APPLICATION_JSON)
                .header("X-User-Role", "ADMIN")
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$[0].id").value(20));
    }
}
