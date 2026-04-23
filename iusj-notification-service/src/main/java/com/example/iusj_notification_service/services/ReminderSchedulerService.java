package com.example.iusj_notification_service.services;

import com.example.iusj_notification_service.entities.Notification;
import com.example.iusj_notification_service.entities.NotificationType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Service de rappels automatiques planifiés.
 *
 * Toutes les 15 minutes, vérifie les cours qui commencent dans ~1h
 * et envoie des rappels (in-app + email + SMS) aux enseignants concernés.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReminderSchedulerService {

    private final NotificationService notificationService;
    private final EmailService emailService;
    private final SmsService smsService;
    private final RestTemplate restTemplate;

    @Value("${app.reminders.enabled:true}")
    private boolean remindersEnabled;

    @Value("${app.reminders.schedule-service-url:http://iusj-schedule-service}")
    private String scheduleServiceUrl;

    @Value("${app.reminders.user-service-url:http://iusj-user-service}")
    private String userServiceUrl;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DT_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    /**
     * Rappel 1h avant le cours — s'exécute toutes les 15 minutes.
     */
    @Scheduled(fixedDelayString = "${app.reminders.interval-ms:900000}")
    public void sendOneHourReminders() {
        if (!remindersEnabled) return;

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime windowStart = now.plusMinutes(55);
        LocalDateTime windowEnd = now.plusMinutes(65);

        log.debug("Rappels 1h : recherche seances entre {} et {}", windowStart, windowEnd);

        List<Map<String, Object>> entries = fetchScheduleEntries(windowStart, windowEnd);
        if (entries.isEmpty()) return;

        for (Map<String, Object> entry : entries) {
            try {
                processReminder(entry, "1 heure");
            } catch (Exception e) {
                log.warn("Erreur traitement rappel pour entry {}: {}", entry.get("id"), e.getMessage());
            }
        }
    }

    /**
     * Rappel 24h avant le cours — s'exécute une fois par jour à 8h00.
     */
    @Scheduled(cron = "${app.reminders.daily-cron:0 0 8 * * *}")
    public void sendDayBeforeReminders() {
        if (!remindersEnabled) return;

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime windowStart = now.plusHours(23).plusMinutes(30);
        LocalDateTime windowEnd = now.plusHours(24).plusMinutes(30);

        log.debug("Rappels 24h : recherche seances entre {} et {}", windowStart, windowEnd);

        List<Map<String, Object>> entries = fetchScheduleEntries(windowStart, windowEnd);
        if (entries.isEmpty()) return;

        for (Map<String, Object> entry : entries) {
            try {
                processReminder(entry, "demain");
            } catch (Exception e) {
                log.warn("Erreur traitement rappel 24h pour entry {}: {}", entry.get("id"), e.getMessage());
            }
        }
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> fetchScheduleEntries(LocalDateTime from, LocalDateTime to) {
        try {
            String url = scheduleServiceUrl + "/api/schedules?startFrom=" + from.format(DT_FMT)
                    + "&endTo=" + to.format(DT_FMT) + "&status=SCHEDULED";
            Map<String, Object>[] result = restTemplate.getForObject(url, Map[].class);
            if (result == null) return List.of();
            return List.of(result);
        } catch (Exception e) {
            log.warn("Impossible de recuperer les seances depuis schedule-service: {}", e.getMessage());
            return List.of();
        }
    }

    @SuppressWarnings("unchecked")
    private void processReminder(Map<String, Object> entry, String delai) {
        Long teacherId = toLong(entry.get("teacherId"));
        String courseLabel = String.valueOf(entry.getOrDefault("courseLabel", "Cours"));
        String roomLabel = String.valueOf(entry.getOrDefault("roomLabel", "Salle non assignee"));
        String startTimeRaw = String.valueOf(entry.getOrDefault("startTime", ""));

        String startTimeLabel = startTimeRaw.length() >= 16 ? startTimeRaw.substring(11, 16) : startTimeRaw;

        if (teacherId == null) return;

        // Notification in-app
        String contenu = String.format("Rappel : cours '%s' en salle %s dans %s (%s)",
                courseLabel, roomLabel, delai, startTimeLabel);

        Notification notif = new Notification();
        notif.setType(NotificationType.EVENT_REMINDER);
        notif.setContenu(contenu);
        notif.setUserId(teacherId);
        notif.setSourceType("SCHEDULE");
        notif.setSourceId(toLong(entry.get("id")));
        notificationService.create(notif);

        // Email + SMS si les infos utilisateur sont disponibles
        Map<String, Object> user = fetchUser(teacherId);
        if (user != null) {
            String email = (String) user.get("email");
            String phone = user.get("telephone") != null ? String.valueOf(user.get("telephone")) : null;
            String name = user.getOrDefault("prenom", "") + " " + user.getOrDefault("nom", "");

            if (email != null && !email.isBlank()) {
                emailService.sendCourseReminder(email, name.trim(), courseLabel, roomLabel, startTimeLabel);
            }
            if (phone != null && !phone.isBlank()) {
                smsService.sendCourseReminder(phone, courseLabel, roomLabel, startTimeLabel);
            }
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> fetchUser(Long userId) {
        try {
            return restTemplate.getForObject(userServiceUrl + "/api/users/" + userId, Map.class);
        } catch (Exception e) {
            log.debug("Impossible de recuperer l'utilisateur {}: {}", userId, e.getMessage());
            return null;
        }
    }

    private Long toLong(Object value) {
        if (value == null) return null;
        if (value instanceof Number n) return n.longValue();
        try { return Long.parseLong(String.valueOf(value)); } catch (NumberFormatException e) { return null; }
    }
}
