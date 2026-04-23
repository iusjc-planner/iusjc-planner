package com.example.iusj_schedule_service.client;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Service
public class RoomServiceClient {

    private final RestTemplate restTemplate;

    public RoomServiceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public RoomSummary getRoom(Long roomId) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> room = restTemplate.getForObject(
                    "http://iusj-room-service/api/rooms/{id}",
                    Map.class,
                    roomId
            );
            if (room == null) {
                return null;
            }
            return toRoomSummary(room);
        } catch (Exception ex) {
            return null;
        }
    }

    public List<RoomSummary> getRoomsByMinCapacity(Integer minCapacity) {
        try {
            String url = minCapacity == null
                    ? "http://iusj-room-service/api/rooms"
                    : "http://iusj-room-service/api/rooms?minCapacity=" + minCapacity;

            Object[] rooms = restTemplate.getForObject(url, Object[].class);
            if (rooms == null) {
                return List.of();
            }

            List<RoomSummary> result = new ArrayList<>();
            for (Object room : rooms) {
                if (room instanceof Map<?, ?> map) {
                    RoomSummary summary = toRoomSummary(map);
                    if (summary != null) {
                        result.add(summary);
                    }
                }
            }

            result.sort(Comparator.comparing(RoomSummary::capacity, Comparator.nullsLast(Integer::compareTo)));
            return result;
        } catch (Exception ex) {
            return List.of();
        }
    }

    /**
     * Retourne les salles filtrées par type et capacité minimale.
     * courseType : CM -> AUDITORIUM, TD -> CLASSROOM, TP -> LAB
     */
    public List<RoomSummary> getRoomsByCourseType(String courseType, Integer minCapacity) {
        String roomType = mapCourseTypeToRoomType(courseType);
        try {
            StringBuilder url = new StringBuilder("http://iusj-room-service/api/rooms?");
            if (roomType != null) url.append("type=").append(roomType).append("&");
            if (minCapacity != null) url.append("minCapacity=").append(minCapacity).append("&");
            url.append("status=ACTIVE");

            Object[] rooms = restTemplate.getForObject(url.toString(), Object[].class);
            if (rooms == null) return List.of();

            List<RoomSummary> result = new ArrayList<>();
            for (Object room : rooms) {
                if (room instanceof Map<?, ?> map) {
                    RoomSummary summary = toRoomSummary(map);
                    if (summary != null) result.add(summary);
                }
            }
            result.sort(Comparator.comparing(RoomSummary::capacity, Comparator.nullsLast(Integer::compareTo)));
            return result;
        } catch (Exception ex) {
            // Fallback: retourner toutes les salles avec capacité minimale
            return getRoomsByMinCapacity(minCapacity);
        }
    }

    private String mapCourseTypeToRoomType(String courseType) {
        if (courseType == null) return null;
        return switch (courseType.toUpperCase()) {
            case "CM", "COURS_MAGISTRAL", "CONFERENCE" -> "AUDITORIUM";
            case "TP", "TRAVAUX_PRATIQUES", "LABO" -> "LAB";
            case "TD", "TRAVAUX_DIRIGES" -> "CLASSROOM";
            default -> null;
        };
    }

    private RoomSummary toRoomSummary(Map<?, ?> room) {
        Long id = asLong(room.get("id"));
        if (id == null) {
            return null;
        }
        String name = asString(room.get("name"));
        Integer capacity = asInteger(room.get("capacity"));
        String status = asString(room.get("status"));
        return new RoomSummary(id, name, capacity, status);
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

    private Integer asInteger(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value instanceof String text) {
            try {
                return Integer.parseInt(text);
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

    public record RoomSummary(Long id, String name, Integer capacity, String status) {
    }
}
