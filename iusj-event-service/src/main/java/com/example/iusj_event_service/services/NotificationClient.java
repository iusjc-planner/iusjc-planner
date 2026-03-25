package com.example.iusj_event_service.services;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationClient {

    private final RestTemplate restTemplate;

    public void notifyParticipants(List<Long> participantIds, String content, Long eventId, Long authorUserId) {
        if (participantIds == null || participantIds.isEmpty()) {
            return;
        }

        for (Long participantId : participantIds) {
            if (participantId == null) {
                continue;
            }
            Map<String, Object> payload = Map.of(
                "type", "EVENT_REMINDER",
                "contenu", content,
                "userId", participantId,
                "dateEnvoi", LocalDateTime.now().toString(),
                "lu", false,
                "sourceType", "EVENT",
                "sourceId", eventId
            );

            HttpHeaders headers = new HttpHeaders();
            headers.add("X-User-Name", "event-service");
            headers.add("X-User-Role", "ADMIN");
            headers.add("X-User-Id", String.valueOf(authorUserId == null ? 0L : authorUserId));

            try {
                restTemplate.exchange(
                    "http://iusj-notification-service/api/notifications",
                    HttpMethod.POST,
                    new HttpEntity<>(payload, headers),
                    Map.class
                );
            } catch (Exception ignored) {
            }
        }
    }
}
