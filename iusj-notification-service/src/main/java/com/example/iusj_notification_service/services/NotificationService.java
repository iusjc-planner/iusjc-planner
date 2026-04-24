package com.example.iusj_notification_service.services;

import com.example.iusj_notification_service.dto.UserSummary;
import com.example.iusj_notification_service.entities.Notification;
import com.example.iusj_notification_service.entities.NotificationType;
import com.example.iusj_notification_service.repositories.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final RestTemplate restTemplate;
    private final EmailService emailService;
    private final SmsService smsService;

    @Transactional(readOnly = true)
    public List<Notification> getAll(Long userId) {
        return notificationRepository.findByUserIdOrderByDateEnvoiDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<Notification> getUnread(Long userId) {
        return notificationRepository.findByUserIdAndLuFalseOrderByDateEnvoiDesc(userId);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndLuFalse(userId);
    }

    public Notification create(Notification notification) {
        notification.setId(null);
        notification.setDateEnvoi(LocalDateTime.now());
        notification.setLu(false);
        return notificationRepository.save(notification);
    }

    public Notification markAsRead(Long id, Long currentUserId, boolean isAdmin) {
        Notification notification = isAdmin
            ? notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification non trouvee"))
            : notificationRepository.findByIdAndUserId(id, currentUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification non trouvee"));

        notification.setLu(true);
        return notificationRepository.save(notification);
    }

    public int markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndLuFalse(userId);
        unread.forEach(n -> n.setLu(true));
        notificationRepository.saveAll(unread);
        return unread.size();
    }

    public void delete(Long id, Long currentUserId, boolean isAdmin) {
        Notification notification = isAdmin
            ? notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification non trouvee"))
            : notificationRepository.findByIdAndUserId(id, currentUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification non trouvee"));

        notificationRepository.delete(notification);
    }

    public List<Notification> broadcast(Notification template, List<Long> userIds) {
        List<Long> recipients = resolveRecipients(userIds);
        if (recipients.isEmpty()) {
            return List.of();
        }

        LocalDateTime now = LocalDateTime.now();
        List<Notification> notifications = new ArrayList<>(recipients.size());
        for (Long userId : recipients) {
            Notification notification = new Notification();
            notification.setType(template.getType());
            notification.setContenu(template.getContenu());
            notification.setDateEnvoi(now);
            notification.setUserId(userId);
            notification.setLu(false);
            notification.setSourceType(template.getSourceType());
            notification.setSourceId(template.getSourceId());
            notifications.add(notification);
        }

        return notificationRepository.saveAll(notifications);
    }

    /**
     * Envoie une notification de changement d'EDT avec email + SMS.
     */
    public void notifyScheduleChange(Long userId, String details) {
        Notification notif = new Notification();
        notif.setType(NotificationType.SCHEDULE_CHANGE);
        notif.setContenu("Votre emploi du temps a ete modifie. " + details);
        notif.setUserId(userId);
        notif.setSourceType("EDT");
        create(notif);

        // Email + SMS
        UserSummary user = fetchUserSummary(userId);
        if (user != null) {
            String name = (user.getPrenom() != null ? user.getPrenom() : "") + " " + (user.getNom() != null ? user.getNom() : "");
            if (user.getEmail() != null && !user.getEmail().isBlank()) {
                emailService.sendScheduleChangeNotification(user.getEmail(), name.trim(), details);
            }
            if (user.getTelephone() != null && !user.getTelephone().isBlank()) {
                smsService.sendScheduleChange(user.getTelephone(), details);
            }
        }
    }

    private UserSummary fetchUserSummary(Long userId) {
        try {
            UserSummary[] users = restTemplate.getForObject("http://iusj-user-service/api/users", UserSummary[].class);
            if (users == null) return null;
            for (UserSummary u : users) {
                if (u != null && userId.equals(u.getId())) return u;
            }
        } catch (Exception e) {
            // service indisponible
        }
        return null;
    }

    private List<Long> resolveRecipients(List<Long> providedUserIds) {
        if (providedUserIds != null && !providedUserIds.isEmpty()) {
            Set<Long> unique = new LinkedHashSet<>(providedUserIds);
            return unique.stream().filter(id -> id != null && id > 0).toList();
        }

        UserSummary[] users = restTemplate.getForObject("http://iusj-user-service/api/users", UserSummary[].class);
        if (users == null || users.length == 0) {
            return List.of();
        }

        List<Long> userIds = new ArrayList<>();
        for (UserSummary user : users) {
            if (user != null && user.getId() != null) {
                userIds.add(user.getId());
            }
        }
        return userIds;
    }
}
