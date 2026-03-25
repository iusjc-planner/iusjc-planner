package com.example.iusj_notification_service.controller;

import com.example.iusj_notification_service.dto.BroadcastRequest;
import com.example.iusj_notification_service.entities.Notification;
import com.example.iusj_notification_service.services.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Notification>> getAll(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(notificationService.getAll(userId));
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnread(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(notificationService.getUnread(userId));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getUnreadCount(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCountAlias(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }

    @PostMapping
    public ResponseEntity<?> create(
            @Valid @RequestBody Notification notification,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        if (!isAdmin(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "Acces refuse - Role ADMIN requis"));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(notificationService.create(notification));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        return ResponseEntity.ok(notificationService.markAsRead(id, userId, isAdmin(role)));
    }

    @PutMapping("/read-all")
    public ResponseEntity<Map<String, Integer>> markAllAsRead(@RequestHeader("X-User-Id") Long userId) {
        int updated = notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("updated", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        notificationService.delete(id, userId, isAdmin(role));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/broadcast")
    public ResponseEntity<?> broadcast(
            @Valid @RequestBody BroadcastRequest request,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        if (!isAdmin(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "Acces refuse - Role ADMIN requis"));
        }

        Notification template = new Notification();
        template.setType(request.getType());
        template.setContenu(request.getContenu());
        template.setSourceType(request.getSourceType());
        template.setSourceId(request.getSourceId());

        List<Notification> sent = notificationService.broadcast(template, request.getUserIds());
        return ResponseEntity.status(HttpStatus.CREATED).body(sent);
    }

    private boolean isAdmin(String role) {
        return role != null && "ADMIN".equalsIgnoreCase(role);
    }
}
