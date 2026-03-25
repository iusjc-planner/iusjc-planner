package com.example.iusj_user_service.services;

import com.example.iusj_user_service.entities.AuditLog;
import com.example.iusj_user_service.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(AuditLog.AuditAction action, String entityType, Long entityId, String details) {
        HttpServletRequest request = currentRequest();

        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setDetails(details);
        log.setTimestamp(LocalDateTime.now());

        if (request != null) {
            log.setUserId(parseLongHeader(request, "X-User-Id"));
            log.setUserLogin(request.getHeader("X-User-Name"));
            log.setIpAddress(extractClientIp(request));
        }

        auditLogRepository.save(log);
    }

    public List<AuditLog> getByEntity(String entityType, Long entityId) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByTimestampDesc(entityType, entityId);
    }

    public List<AuditLog> getByUser(Long userId) {
        return auditLogRepository.findByUserIdOrderByTimestampDesc(userId);
    }

    public List<AuditLog> getByDateRange(LocalDateTime from, LocalDateTime to) {
        return auditLogRepository.findByTimestampBetweenOrderByTimestampDesc(from, to);
    }

    public Page<AuditLog> getAll(LocalDateTime from, LocalDateTime to, Long userId, String entityType, Pageable pageable) {
        Specification<AuditLog> spec = Specification.where(null);

        if (from != null && to != null) {
            spec = spec.and((root, query, cb) -> cb.between(root.get("timestamp"), from, to));
        } else if (from != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("timestamp"), from));
        } else if (to != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("timestamp"), to));
        }

        if (userId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("userId"), userId));
        }

        if (entityType != null && !entityType.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(cb.lower(root.get("entityType")), entityType.toLowerCase()));
        }

        Pageable sortedPage = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(Sort.Direction.DESC, "timestamp"));
        return auditLogRepository.findAll(spec, sortedPage);
    }

    private HttpServletRequest currentRequest() {
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attrs) {
            return attrs.getRequest();
        }
        return null;
    }

    private Long parseLongHeader(HttpServletRequest request, String headerName) {
        try {
            String raw = request.getHeader(headerName);
            return raw == null || raw.isBlank() ? null : Long.parseLong(raw);
        } catch (NumberFormatException ignored) {
            return null;
        }
    }

    private String extractClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
