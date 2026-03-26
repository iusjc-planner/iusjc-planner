package com.example.iusj_notification_service.repositories;

import com.example.iusj_notification_service.entities.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByDateEnvoiDesc(Long userId);

    List<Notification> findByUserIdAndLuFalseOrderByDateEnvoiDesc(Long userId);

    long countByUserIdAndLuFalse(Long userId);

    Optional<Notification> findByIdAndUserId(Long id, Long userId);

    List<Notification> findByUserIdAndLuFalse(Long userId);
}
