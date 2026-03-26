package com.example.iusj_schedule_service.client;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class CourseCatalogClient {

    private final RestTemplate restTemplate;

    public CourseCatalogClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public List<CourseSummary> getCoursesByDateRange(LocalDate fromDate, LocalDate toDate, List<String> statuses) {
        try {
            UriComponentsBuilder builder = UriComponentsBuilder
                    .fromUriString("http://iusj-course-service/api/courses")
                    .queryParam("dateFrom", fromDate)
                    .queryParam("dateTo", toDate);

            for (String status : statuses) {
                builder.queryParam("status", status);
            }

            URI uri = builder.build(true).toUri();
            Object[] response = restTemplate.getForObject(uri, Object[].class);
            if (response == null) {
                return List.of();
            }

            List<CourseSummary> courses = new ArrayList<>();
            for (Object row : response) {
                if (row instanceof Map<?, ?> map) {
                    CourseSummary summary = toCourseSummary(map);
                    if (summary != null) {
                        courses.add(summary);
                    }
                }
            }
            return courses;
        } catch (Exception ex) {
            return List.of();
        }
    }

    public CourseSummary getCourse(Long courseId) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> raw = restTemplate.getForObject(
                    "http://iusj-course-service/api/courses/{id}",
                    Map.class,
                    courseId
            );
            return raw == null ? null : toCourseSummary(raw);
        } catch (Exception ex) {
            return null;
        }
    }

    public MatiereSummary getMatiere(Long matiereId) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> raw = restTemplate.getForObject(
                    "http://iusj-course-service/api/matieres/{id}",
                    Map.class,
                    matiereId
            );
            return raw == null ? null : toMatiereSummary(raw);
        } catch (Exception ex) {
            return null;
        }
    }

    private CourseSummary toCourseSummary(Map<?, ?> map) {
        Long id = asLong(map.get("id"));
        if (id == null) {
            return null;
        }
        return new CourseSummary(
                id,
                asLong(map.get("matiereId")),
                asString(map.get("type")),
                asString(map.get("title")),
                asDate(map.get("date")),
                asTime(map.get("startTime")),
                asTime(map.get("endTime")),
                asLong(map.get("roomId")),
                asLong(map.get("groupId")),
                asLong(map.get("teacherId")),
                asString(map.get("status"))
        );
    }

    private MatiereSummary toMatiereSummary(Map<?, ?> map) {
        Long id = asLong(map.get("id"));
        if (id == null) {
            return null;
        }
        return new MatiereSummary(
                id,
                asString(map.get("code")),
                asString(map.get("nom")),
                asLong(map.get("teacherId"))
        );
    }

    private String asString(Object value) {
        return value == null ? null : value.toString();
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

    private LocalDate asDate(Object value) {
        if (value == null) {
            return null;
        }
        try {
            return LocalDate.parse(value.toString());
        } catch (DateTimeParseException ex) {
            return null;
        }
    }

    private LocalTime asTime(Object value) {
        if (value == null) {
            return null;
        }
        String text = value.toString();
        try {
            return LocalTime.parse(text);
        } catch (DateTimeParseException ignored) {
        }

        // Handles values like "08:00:00.000".
        int dot = text.indexOf('.');
        if (dot > 0) {
            try {
                return LocalTime.parse(text.substring(0, dot));
            } catch (DateTimeParseException ignored) {
                return null;
            }
        }
        return null;
    }

    public record CourseSummary(
            Long id,
            Long matiereId,
            String type,
            String title,
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime,
            Long roomId,
            Long groupId,
            Long teacherId,
            String status
    ) {
    }

    public record MatiereSummary(
            Long id,
            String code,
            String nom,
            Long teacherId
    ) {
    }
}
