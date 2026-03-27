package com.example.iusj_user_service.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Component
public class TeacherServiceClient {

    private final RestTemplate restTemplate;
    
    @Value("${services.teacher.url:http://localhost:8083}")
    private String teacherServiceUrl;

    public TeacherServiceClient() {
        this.restTemplate = new RestTemplate();
    }

    @Async
    public void createTeacher(Long userId, String nom, String prenom, String email, String telephone) {
        try {
            String url = teacherServiceUrl + "/api/teachers";
            
            Map<String, Object> teacherData = new HashMap<>();
            teacherData.put("userId", userId);
            teacherData.put("nom", nom);
            teacherData.put("prenom", prenom);
            teacherData.put("email", email);
            teacherData.put("telephone", telephone);
            teacherData.put("status", "ACTIVE");
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(teacherData, headers);
            
            restTemplate.postForObject(url, request, Object.class);
            
            System.out.println("Teacher créé avec succès pour l'utilisateur: " + userId);
        } catch (Exception e) {
            System.err.println("Erreur lors de la création du teacher: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void deleteTeacherByUserId(Long userId) {
        try {
            String url = teacherServiceUrl + "/api/teachers/by-user/" + userId;
            restTemplate.delete(url);
            System.out.println("Teacher supprimé pour l'utilisateur: " + userId);
        } catch (Exception e) {
            System.err.println("Erreur lors de la suppression du teacher: " + e.getMessage());
        }
    }
}
