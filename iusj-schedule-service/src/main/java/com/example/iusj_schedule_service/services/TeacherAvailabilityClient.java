package com.example.iusj_schedule_service.services;

import com.example.iusj_schedule_service.client.IdentityDirectoryClient;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.List;

@Service
public class TeacherAvailabilityClient {

    private final RestTemplate restTemplate;
    private final IdentityDirectoryClient identityDirectoryClient;

    public TeacherAvailabilityClient(RestTemplate restTemplate, IdentityDirectoryClient identityDirectoryClient) {
        this.restTemplate = restTemplate;
        this.identityDirectoryClient = identityDirectoryClient;
    }

    public boolean isAvailable(Long teacherId, LocalDate date) {
        try {
            IdentityDirectoryClient.TeacherSummary teacher = identityDirectoryClient.getTeacher(teacherId);
            if (teacher == null || teacher.userId() == null) {
                return true;
            }
            String url = "http://iusj-teacher-service/api/teachers/" + teacher.userId() + "/disponibilites/available/date/" + date;
            Object[] response = restTemplate.getForObject(url, Object[].class);
            return response != null && response.length > 0;
        } catch (Exception ex) {
            return true;
        }
    }

    public List<Object> getWeekAvailability(Long teacherId, Integer week, Integer year) {
        try {
            IdentityDirectoryClient.TeacherSummary teacher = identityDirectoryClient.getTeacher(teacherId);
            if (teacher == null || teacher.userId() == null) {
                return List.of();
            }
            String url = "http://iusj-teacher-service/api/teachers/" + teacher.userId() + "/disponibilites";
            Object[] response = restTemplate.getForObject(url, Object[].class);
            return response == null ? List.of() : List.of(response);
        } catch (Exception ex) {
            return List.of();
        }
    }
}
