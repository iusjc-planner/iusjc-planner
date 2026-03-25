package com.example.iusj_event_service.services;

import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RoomClient {

    private final RestTemplate restTemplate;

    public boolean isRoomActive(Long salleId) {
        if (salleId == null) {
            return true;
        }
        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                "http://iusj-room-service/api/rooms/" + salleId,
                HttpMethod.GET,
                new HttpEntity<>(new HttpHeaders()),
                new ParameterizedTypeReference<>() {
                }
            );
            Map<String, Object> body = response.getBody();
            if (body == null) {
                return false;
            }
            Object status = body.get("status");
            return status != null && "ACTIVE".equalsIgnoreCase(status.toString());
        } catch (Exception ex) {
            return false;
        }
    }

    public boolean isRoomAvailable(Long salleId, LocalDate date, LocalTime heureDebut, Integer dureeMinutes) {
        if (salleId == null) {
            return true;
        }
        LocalDateTime start = LocalDateTime.of(date, heureDebut);
        LocalDateTime end = start.plusMinutes(dureeMinutes);

        String url = "http://iusj-room-service/api/rooms/available?start="
            + start.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
            + "&end="
            + end.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
            + "&minCapacity=1";

        try {
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                new HttpEntity<>(new HttpHeaders()),
                new ParameterizedTypeReference<>() {
                }
            );
            List<Map<String, Object>> rooms = response.getBody();
            if (rooms == null) {
                return false;
            }
            return rooms.stream().anyMatch(room -> salleId.equals(asLong(room.get("id"))));
        } catch (Exception ex) {
            return true;
        }
    }

    public Long reserveRoom(Long salleId, LocalDate date, LocalTime heureDebut, Integer dureeMinutes, Long userId, String purpose) {
        if (salleId == null) {
            return null;
        }

        LocalDateTime start = LocalDateTime.of(date, heureDebut);
        LocalDateTime end = start.plusMinutes(dureeMinutes);

        Map<String, Object> payload = Map.of(
            "startTime", start.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
            "endTime", end.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
            "reservedByUserId", userId,
            "purpose", purpose == null ? "Evenement" : purpose
        );

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                "http://iusj-room-service/api/rooms/" + salleId + "/reserve",
                HttpMethod.POST,
                new HttpEntity<>(payload, new HttpHeaders()),
                new ParameterizedTypeReference<>() {
                }
            );
            Map<String, Object> body = response.getBody();
            if (body == null) {
                return null;
            }
            return asLong(body.get("id"));
        } catch (Exception ex) {
            throw new IllegalStateException("Reservation de salle impossible", ex);
        }
    }

    public void cancelReservation(Long salleId, Long reservationId) {
        if (salleId == null || reservationId == null) {
            return;
        }
        try {
            restTemplate.exchange(
                "http://iusj-room-service/api/rooms/" + salleId + "/reservations/" + reservationId,
                HttpMethod.DELETE,
                new HttpEntity<>(new HttpHeaders()),
                Void.class
            );
        } catch (Exception ignored) {
        }
    }

    private Long asLong(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.longValue();
        }
        return Long.parseLong(value.toString());
    }
}
