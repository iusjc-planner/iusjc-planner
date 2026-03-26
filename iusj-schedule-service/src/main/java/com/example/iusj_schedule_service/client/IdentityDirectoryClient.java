package com.example.iusj_schedule_service.client;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class IdentityDirectoryClient {

    private final RestTemplate restTemplate;

    public IdentityDirectoryClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public TeacherSummary getTeacher(Long teacherId) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> raw = restTemplate.getForObject(
                    "http://iusj-teacher-service/api/teachers/{id}",
                    Map.class,
                    teacherId
            );
            if (raw == null) {
                return null;
            }
            return new TeacherSummary(asLong(raw.get("id")), asLong(raw.get("userId")));
        } catch (Exception ex) {
            return null;
        }
    }

    public UserSummary getUser(Long userId) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> raw = restTemplate.getForObject(
                    "http://iusj-user-service/api/users/{id}",
                    Map.class,
                    userId
            );
            if (raw == null) {
                return null;
            }
            return new UserSummary(
                    asLong(raw.get("id")),
                    asString(raw.get("nom")),
                    asString(raw.get("prenom"))
            );
        } catch (Exception ex) {
            return null;
        }
    }

    public String resolveTeacherDisplayName(Long teacherId) {
        if (teacherId == null) {
            return "Enseignant non assigne";
        }

        TeacherSummary teacher = getTeacher(teacherId);
        if (teacher == null || teacher.userId() == null) {
            return "Enseignant #" + teacherId;
        }

        UserSummary user = getUser(teacher.userId());
        if (user == null) {
            return "Enseignant #" + teacherId;
        }

        String fullName = ((user.prenom() == null ? "" : user.prenom().trim()) + " "
                + (user.nom() == null ? "" : user.nom().trim())).trim();
        return fullName.isBlank() ? "Enseignant #" + teacherId : fullName;
    }

    private Long asLong(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        if (value instanceof String text) {
            try {
                return Long.parseLong(text);
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

    private String asString(Object value) {
        return value == null ? null : value.toString();
    }

    public record TeacherSummary(Long id, Long userId) {
    }

    public record UserSummary(Long id, String nom, String prenom) {
    }
}
