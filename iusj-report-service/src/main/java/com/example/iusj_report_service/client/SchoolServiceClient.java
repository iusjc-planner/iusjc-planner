package com.example.iusj_report_service.client;

import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class SchoolServiceClient {

    private final RestTemplate restTemplate;

    public List<Map<String, Object>> getSchools() {
        try {
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                "http://iusj-school-service/api/schools",
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

    public Map<String, Object> getSchoolStats() {
        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                "http://iusj-school-service/api/schools/stats",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<>() {
                }
            );
            return response.getBody();
        } catch (Exception ex) {
            return Collections.emptyMap();
        }
    }
}
