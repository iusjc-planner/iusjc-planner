package com.example.iusj_user_service.controller;

import com.example.iusj_user_service.entities.AuditLog;
import com.example.iusj_user_service.services.AuditService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/audit")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping
    public ResponseEntity<?> getAll(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String entityType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (!isAdmin(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
        }

        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        Page<AuditLog> logs = auditService.getAll(from, to, userId, entityType, pageable);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/entity/{type}/{id}")
    public ResponseEntity<?> getByEntity(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @PathVariable String type,
            @PathVariable Long id) {
        if (!isAdmin(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
        }

        List<AuditLog> logs = auditService.getByEntity(type, id);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getByUser(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @PathVariable Long userId) {
        if (!isAdmin(userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
        }

        List<AuditLog> logs = auditService.getByUser(userId);
        return ResponseEntity.ok(logs);
    }

    private boolean isAdmin(String role) {
        if (role == null) {
            return false;
        }
        String normalized = role.toUpperCase().replace("ROLE_", "");
        return "ADMIN".equals(normalized);
    }
}
