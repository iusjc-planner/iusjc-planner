package com.example.iusj_auth_service.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

/**
 * Service d'envoi d'emails pour l'auth-service (reset password).
 */
@Service
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@iusj-planner.cd}")
    private String fromAddress;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.mail.reset-url:http://localhost:4200/auth/reset-password}")
    private String resetUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Envoie l'email de réinitialisation de mot de passe.
     */
    public void sendPasswordResetEmail(String to, String userName, String token) {
        if (!mailEnabled) {
            log.info("[EMAIL DISABLED] Reset password token for {}: {}", to, token);
            return;
        }
        String link = resetUrl + "?token=" + token;
        String subject = "[IUSJ Planner] Réinitialisation de votre mot de passe";
        String html = "<html><body style='font-family:Arial,sans-serif;'>"
            + "<h2 style='color:#3b82f6;'>IUSJ Planner</h2>"
            + "<p>Bonjour <strong>" + userName + "</strong>,</p>"
            + "<p>Vous avez demandé la réinitialisation de votre mot de passe.</p>"
            + "<p>Cliquez sur le bouton ci-dessous (lien valable <strong>30 minutes</strong>) :</p>"
            + "<p><a href='" + link + "' style='background:#3b82f6;color:white;padding:12px 24px;"
            + "border-radius:6px;text-decoration:none;font-weight:bold;'>Réinitialiser mon mot de passe</a></p>"
            + "<p>Ou copiez ce lien dans votre navigateur :<br/><code>" + link + "</code></p>"
            + "<p>Si vous n'avez pas fait cette demande, ignorez cet email.</p>"
            + "<hr/><small>IUSJ Planner — Institut Universitaire Saint-Jérôme du Congo</small>"
            + "</body></html>";

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
            log.info("Email reset password envoye a {}", to);
        } catch (MessagingException | MailException e) {
            log.error("Echec envoi email reset password a {}: {}", to, e.getMessage());
        }
    }
}
