package com.example.iusj_notification_service.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.Base64;

/**
 * Service d'envoi de SMS via l'API Twilio.
 *
 * Configuration requise dans application.properties :
 *   app.sms.enabled=true
 *   app.sms.twilio.account-sid=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *   app.sms.twilio.auth-token=your_auth_token
 *   app.sms.twilio.from-number=+1234567890
 */
@Service
@Slf4j
public class SmsService {

    private static final String TWILIO_API_URL = "https://api.twilio.com/2010-04-01/Accounts/{accountSid}/Messages.json";

    @Value("${app.sms.enabled:false}")
    private boolean smsEnabled;

    @Value("${app.sms.twilio.account-sid:}")
    private String accountSid;

    @Value("${app.sms.twilio.auth-token:}")
    private String authToken;

    @Value("${app.sms.twilio.from-number:}")
    private String fromNumber;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Envoie un SMS au numéro donné.
     * @param to   Numéro destinataire au format international (+243XXXXXXXXX)
     * @param body Contenu du message (max 160 caractères recommandé)
     */
    public void send(String to, String body) {
        if (!smsEnabled) {
            log.info("[SMS DISABLED] To={} Body={}", to, body);
            return;
        }
        if (accountSid == null || accountSid.isBlank() || authToken == null || authToken.isBlank()) {
            log.warn("SMS non envoye : configuration Twilio manquante (account-sid ou auth-token vide)");
            return;
        }
        if (to == null || to.isBlank()) {
            log.warn("SMS non envoye : numero destinataire vide");
            return;
        }

        try {
            String url = TWILIO_API_URL.replace("{accountSid}", accountSid);
            String credentials = Base64.getEncoder().encodeToString((accountSid + ":" + authToken).getBytes());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.set("Authorization", "Basic " + credentials);

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("From", fromNumber);
            params.add("To", to);
            params.add("Body", body);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("SMS envoye a {}", to);
            } else {
                log.error("Echec envoi SMS a {} : status={}", to, response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("Erreur envoi SMS a {} : {}", to, e.getMessage());
        }
    }

    /**
     * Envoie un rappel de cours par SMS.
     */
    public void sendCourseReminder(String to, String courseLabel, String roomLabel, String startTime) {
        String msg = String.format("[IUSJ] Rappel : cours '%s' en salle %s a %s", courseLabel, roomLabel, startTime);
        send(to, msg);
    }

    /**
     * Envoie une notification de changement d'EDT par SMS.
     */
    public void sendScheduleChange(String to, String details) {
        String msg = "[IUSJ] Votre emploi du temps a ete modifie. " + details;
        // Tronquer si trop long
        if (msg.length() > 160) msg = msg.substring(0, 157) + "...";
        send(to, msg);
    }
}
