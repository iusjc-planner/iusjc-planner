package com.example.iusj_schedule_service.services;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.List;

@Service
public class TeacherAvailabilityClient {

    private final RestTemplate restTemplate;

    public TeacherAvailabilityClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public boolean isAvailable(Long teacherId, LocalDate date) {
        try {
            String url = "http://iusj-teacher-service/api/teachers/" + teacherId + "/availability?date=" + date;
            Object response = restTemplate.getForObject(url, Object.class);
            return response != null;
        } catch (Exception ex) {
            return true;
        }
    }

    public List<Object> getWeekAvailability(Long teacherId, Integer week, Integer year) {
        try {
            String url = "http://iusj-teacher-service/api/teachers/" + teacherId + "/availability/week?week=" + week + "&year=" + year;
            Object[] response = restTemplate.getForObject(url, Object[].class);
            return response == null ? List.of() : List.of(response);
        } catch (Exception ex) {
            return List.of();
        }
    }
}
