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
public class TeacherServiceClient {

    private final RestTemplate restTemplate;

    public List<Map<String, Object>> getTeachers() {
        try {
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                "http://iusj-teacher-service/api/teachers",
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
