package com.example.iusj_notification_service.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

/**
 * Service d'envoi d'emails via SMTP (Gmail, Outlook, etc.)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@iusj-planner.cd}")
    private String fromAddress;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    /**
     * Envoie un email HTML.
     */
    public void sendHtml(String to, String subject, String htmlBody) {
        if (!mailEnabled) {
            log.info("[EMAIL DISABLED] To={} Subject={}", to, subject);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Email HTML envoye a {}", to);
        } catch (MessagingException | MailException e) {
            log.error("Echec envoi email HTML a {}: {}", to, e.getMessage());
        }
    }

    /**
     * Envoie un email texte simple.
     */
    public void sendText(String to, String subject, String body) {
        if (!mailEnabled) {
            log.info("[EMAIL DISABLED] To={} Subject={}", to, subject);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email texte envoye a {}", to);
        } catch (MailException e) {
            log.error("Echec envoi email texte a {}: {}", to, e.getMessage());
        }
    }

    /**
     * Envoie un email de notification de changement d'emploi du temps.
     */
    public void sendScheduleChangeNotification(String to, String teacherName, String details) {
        String subject = "[IUSJ Planner] Modification de votre emploi du temps";
        String body = buildScheduleChangeHtml(teacherName, details);
        sendHtml(to, subject, body);
    }

    /**
     * Envoie un rappel de cours.
     */
    public void sendCourseReminder(String to, String recipientName, String courseLabel,
                                    String roomLabel, String startTime) {
        String subject = "[IUSJ Planner] Rappel : cours dans 1 heure";
        String body = buildCourseReminderHtml(recipientName, courseLabel, roomLabel, startTime);
        sendHtml(to, subject, body);
    }

    /**
     * Envoie un email de réinitialisation de mot de passe.
     */
    public void sendPasswordReset(String to, String userName, String resetToken, String resetUrl) {
        String subject = "[IUSJ Planner] Réinitialisation de votre mot de passe";
        String body = buildPasswordResetHtml(userName, resetToken, resetUrl);
        sendHtml(to, subject, body);
    }

    // ---- Templates HTML ----

    private String buildScheduleChangeHtml(String name, String details) {
        return "<html><body style='font-family:Arial,sans-serif;'>"
            + "<h2 style='color:#3b82f6;'>IUSJ Planner</h2>"
            + "<p>Bonjour <strong>" + name + "</strong>,</p>"
            + "<p>Votre emploi du temps a été modifié :</p>"
            + "<div style='background:#f3f4f6;padding:12px;border-radius:6px;'>" + details + "</div>"
            + "<p>Connectez-vous à l'application pour consulter les détails.</p>"
            + "<hr/><small>IUSJ Planner — Institut Universitaire Saint-Jérôme du Congo</small>"
            + "</body></html>";
    }

    private String buildCourseReminderHtml(String name, String course, String room, String time) {
        return "<html><body style='font-family:Arial,sans-serif;'>"
            + "<h2 style='color:#3b82f6;'>IUSJ Planner — Rappel de cours</h2>"
            + "<p>Bonjour <strong>" + name + "</strong>,</p>"
            + "<p>Vous avez un cours dans <strong>1 heure</strong> :</p>"
            + "<table style='border-collapse:collapse;width:100%;'>"
            + "<tr><td style='padding:8px;border:1px solid #e5e7eb;'><strong>Cours</strong></td><td style='padding:8px;border:1px solid #e5e7eb;'>" + course + "</td></tr>"
            + "<tr><td style='padding:8px;border:1px solid #e5e7eb;'><strong>Salle</strong></td><td style='padding:8px;border:1px solid #e5e7eb;'>" + room + "</td></tr>"
            + "<tr><td style='padding:8px;border:1px solid #e5e7eb;'><strong>Heure</strong></td><td style='padding:8px;border:1px solid #e5e7eb;'>" + time + "</td></tr>"
            + "</table>"
            + "<hr/><small>IUSJ Planner</small>"
            + "</body></html>";
    }

    private String buildPasswordResetHtml(String name, String token, String resetUrl) {
        String link = resetUrl + "?token=" + token;
        return "<html><body style='font-family:Arial,sans-serif;'>"
            + "<h2 style='color:#3b82f6;'>IUSJ Planner — Réinitialisation du mot de passe</h2>"
            + "<p>Bonjour <strong>" + name + "</strong>,</p>"
            + "<p>Vous avez demandé la réinitialisation de votre mot de passe.</p>"
            + "<p>Cliquez sur le lien ci-dessous (valable 30 minutes) :</p>"
            + "<a href='" + link + "' style='background:#3b82f6;color:white;padding:10px 20px;border-radius:4px;text-decoration:none;'>Réinitialiser mon mot de passe</a>"
            + "<p>Ou copiez ce token : <code>" + token + "</code></p>"
            + "<p>Si vous n'avez pas fait cette demande, ignorez cet email.</p>"
            + "<hr/><small>IUSJ Planner</small>"
            + "</body></html>";
    }
}
