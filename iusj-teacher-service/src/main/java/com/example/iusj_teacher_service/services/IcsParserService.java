package com.example.iusj_teacher_service.services;

import com.example.iusj_teacher_service.entities.Disponibilite;
import net.fortuna.ical4j.data.CalendarBuilder;
import net.fortuna.ical4j.data.ParserException;
import net.fortuna.ical4j.model.Calendar;
import net.fortuna.ical4j.model.Component;
import net.fortuna.ical4j.model.Property;
import net.fortuna.ical4j.model.component.VEvent;
import net.fortuna.ical4j.model.property.DtEnd;
import net.fortuna.ical4j.model.property.DtStart;
import net.fortuna.ical4j.model.property.Summary;
import net.fortuna.ical4j.model.property.Uid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Service pour parser les fichiers ICS (iCalendar) exportés depuis Google Calendar.
 */
@Service
public class IcsParserService {
    
    private static final Logger logger = LoggerFactory.getLogger(IcsParserService.class);
    
    // Fuseau horaire par défaut (France)
    private static final ZoneId DEFAULT_TIMEZONE = ZoneId.of("Europe/Paris");
    
    // Heures de travail par défaut
    private static final LocalTime WORK_START = LocalTime.of(8, 0);
    private static final LocalTime WORK_END = LocalTime.of(18, 0);

    /**
     * Parse un fichier ICS et retourne la liste des disponibilités.
     */
    public List<Disponibilite> parseIcsFile(MultipartFile file, Long teacherId) throws IcsParseException {
        List<Disponibilite> disponibilites = new ArrayList<>();
        
        try (InputStream inputStream = file.getInputStream()) {
            CalendarBuilder builder = new CalendarBuilder();
            Calendar calendar = builder.build(inputStream);
            
            // Parcourir tous les événements VEVENT
            for (Object component : calendar.getComponents(Component.VEVENT)) {
                VEvent event = (VEvent) component;
                
                try {
                    Disponibilite disponibilite = parseEvent(event, teacherId);
                    if (disponibilite != null) {
                        disponibilites.add(disponibilite);
                    }
                } catch (Exception e) {
                    logger.warn("Impossible de parser l'événement: {}", getEventSummary(event), e);
                }
            }
            
            logger.info("Fichier ICS parsé avec succès: {} événements extraits pour l'enseignant {}", 
                disponibilites.size(), teacherId);
            
        } catch (IOException | ParserException e) {
            throw new IcsParseException("Erreur lors du parsing du fichier ICS: " + e.getMessage(), e);
        }
        
        return disponibilites;
    }
    
    /**
     * Parse un événement iCal et le convertit en Disponibilite
     */
    private Disponibilite parseEvent(VEvent event, Long teacherId) {
        DtStart dtStart = event.getStartDate();
        DtEnd dtEnd = event.getEndDate();
        Uid uid = event.getUid();
        Summary summary = event.getSummary();
        
        if (dtStart == null || dtEnd == null) {
            logger.warn("Événement ignoré: dates manquantes");
            return null;
        }
        
        LocalDateTime startDateTime = convertIcalDate(dtStart.getDate());
        LocalDateTime endDateTime = convertIcalDate(dtEnd.getDate());
        
        if (startDateTime == null || endDateTime == null) {
            return null;
        }
        
        // Filtrer les événements en dehors des heures de travail
        if (!isWithinWorkingHours(startDateTime, endDateTime)) {
            logger.debug("Événement ignoré (hors heures de travail): {}", getEventSummary(event));
            return null;
        }
        
        Disponibilite disponibilite = new Disponibilite();
        disponibilite.setDate(startDateTime.toLocalDate());
        disponibilite.setHeureDebut(startDateTime.toLocalTime());
        
        // Calculer la durée en minutes
        long durationMinutes = java.time.temporal.ChronoUnit.MINUTES.between(startDateTime, endDateTime);
        disponibilite.setDuree((int) durationMinutes);
        
        disponibilite.setFromIcsImport(true);
        
        if (uid != null) {
            disponibilite.setIcsEventUid(uid.getValue());
        }
        
        return disponibilite;
    }
    
    /**
     * Convertit une date iCal4j en LocalDateTime
     */
    private LocalDateTime convertIcalDate(net.fortuna.ical4j.model.Date icalDate) {
        if (icalDate == null) {
            return null;
        }
        
        try {
            Date javaDate = new Date(icalDate.getTime());
            return javaDate.toInstant().atZone(DEFAULT_TIMEZONE).toLocalDateTime();
        } catch (Exception e) {
            logger.warn("Impossible de convertir la date iCal: {}", icalDate, e);
            return null;
        }
    }
    
    /**
     * Vérifie si l'événement est dans les heures de travail
     */
    private boolean isWithinWorkingHours(LocalDateTime start, LocalDateTime end) {
        LocalTime startTime = start.toLocalTime();
        LocalTime endTime = end.toLocalTime();
        
        // Accepter les événements toute la journée
        if (startTime.equals(LocalTime.MIDNIGHT) && endTime.equals(LocalTime.MIDNIGHT)) {
            return true;
        }
        
        // Vérifier si l'événement chevauche les heures de travail
        return !endTime.isBefore(WORK_START) && !startTime.isAfter(WORK_END);
    }
    
    /**
     * Récupère le résumé d'un événement pour les logs
     */
    private String getEventSummary(VEvent event) {
        Summary summary = event.getSummary();
        return summary != null ? summary.getValue() : "Sans titre";
    }
    
    /**
     * Exception personnalisée pour les erreurs de parsing ICS
     */
    public static class IcsParseException extends Exception {
        public IcsParseException(String message) {
            super(message);
        }
        
        public IcsParseException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}

