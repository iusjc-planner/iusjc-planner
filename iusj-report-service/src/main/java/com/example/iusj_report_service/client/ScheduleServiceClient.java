package com.example.iusj_report_service.client;

import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class ScheduleServiceClient {

    private final RestTemplate restTemplate;

    public List<Map<String, Object>> getScheduleEntries(LocalDate from, LocalDate to) {
        try {
            LocalDateTime start = from.atStartOfDay();
            LocalDateTime end = to.atTime(LocalTime.MAX);
            String url = "http://iusj-schedule-service/api/schedule?startFrom=" + start + "&endTo=" + end;
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<>() {
                }
            );
            return response.getBody() == null ? Collections.emptyList() : response.getBody();
        } catch (Exception ex) {
            return Collections.emptyList();
        }
    }
}
