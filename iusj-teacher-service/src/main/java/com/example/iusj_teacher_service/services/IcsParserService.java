package com.example.iusj_teacher_service.services;

import com.example.iusj_teacher_service.entities.TeacherAvailability;
import com.example.iusj_teacher_service.entities.TeacherAvailability.AvailabilityStatus;
import com.example.iusj_teacher_service.entities.TeacherAvailability.AvailabilityType;
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
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Service pour parser les fichiers ICS (iCalendar) exportés depuis Google Calendar.
 * 
 * Flow d'utilisation:
 * 1. L'enseignant exporte son calendrier Google Calendar (Settings > Import & Export > Export)
 * 2. L'enseignant envoie le fichier .ics à l'admin
 * 3. L'admin upload le fichier via l'interface /app/teachers/{id}/availability
 * 4. Ce service parse le fichier et extrait les événements comme indisponibilités
 * 5. Les indisponibilités sont stockées dans la table teacher_availability
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
     * Parse un fichier ICS et retourne la liste des indisponibilités.
     * 
     * @param file Le fichier ICS uploadé
     * @param teacherId L'ID de l'enseignant
     * @return Liste des indisponibilités extraites du fichier
     * @throws IcsParseException En cas d'erreur de parsing
     */
    public List<TeacherAvailability> parseIcsFile(MultipartFile file, Long teacherId) throws IcsParseException {
        List<TeacherAvailability> availabilities = new ArrayList<>();
        
        try (InputStream inputStream = file.getInputStream()) {
            CalendarBuilder builder = new CalendarBuilder();
            Calendar calendar = builder.build(inputStream);
            
            // Parcourir tous les événements VEVENT
            for (Object component : calendar.getComponents(Component.VEVENT)) {
                VEvent event = (VEvent) component;
                
                try {
                    TeacherAvailability availability = parseEvent(event, teacherId);
                    if (availability != null) {
                        availabilities.add(availability);
                    }
                } catch (Exception e) {
                    logger.warn("Impossible de parser l'événement: {}", getEventSummary(event), e);
                    // Continuer avec les autres événements
                }
            }
            
            logger.info("Fichier ICS parsé avec succès: {} événements extraits pour l'enseignant {}", 
                availabilities.size(), teacherId);
            
        } catch (IOException | ParserException e) {
            throw new IcsParseException("Erreur lors du parsing du fichier ICS: " + e.getMessage(), e);
        }
        
        return availabilities;
    }
    
    /**
     * Parse un événement iCal et le convertit en TeacherAvailability
     */
    private TeacherAvailability parseEvent(VEvent event, Long teacherId) {
        // Récupérer les propriétés de l'événement
        DtStart dtStart = event.getStartDate();
        DtEnd dtEnd = event.getEndDate();
        Uid uid = event.getUid();
        Summary summary = event.getSummary();
        
        if (dtStart == null || dtEnd == null) {
            logger.warn("Événement ignoré: dates manquantes");
            return null;
        }
        
        // Convertir les dates iCal4j en LocalDateTime
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
        
        TeacherAvailability availability = new TeacherAvailability();
        availability.setTeacherId(teacherId);
        availability.setStatus(AvailabilityStatus.UNAVAILABLE);
        availability.setFromIcsImport(true);
        
        if (uid != null) {
            availability.setIcsEventUid(uid.getValue());
        }
        
        if (summary != null) {
            availability.setReason(truncateReason(summary.getValue()));
        }
        
        // Déterminer le type d'événement
        boolean isAllDay = isAllDayEvent(dtStart);
        boolean isRecurring = event.getProperty(Property.RRULE) != null;
        
        if (isAllDay) {
            // Événement sur toute la journée
            LocalDate startDate = startDateTime.toLocalDate();
            LocalDate endDate = endDateTime.toLocalDate();
            
            if (startDate.equals(endDate) || endDate.minusDays(1).equals(startDate)) {
                // Une seule journée
                availability.setAvailabilityType(AvailabilityType.SPECIFIC_DATE);
                availability.setSpecificDate(startDate);
            } else {
                // Plusieurs jours
                availability.setAvailabilityType(AvailabilityType.DATE_RANGE);
                availability.setSpecificDate(startDate);
                availability.setEndDate(endDate.minusDays(1)); // Ajuster car la fin est exclusive
            }
            
            availability.setStartTime(WORK_START);
            availability.setEndTime(WORK_END);
            
        } else if (isRecurring) {
            // Événement récurrent
            availability.setAvailabilityType(AvailabilityType.WEEKLY_RECURRING);
            availability.setDayOfWeek(startDateTime.getDayOfWeek().getValue());
            availability.setStartTime(startDateTime.toLocalTime());
            availability.setEndTime(endDateTime.toLocalTime());
            
        } else {
            // Événement ponctuel avec horaires précis
            availability.setAvailabilityType(AvailabilityType.SPECIFIC_DATE);
            availability.setSpecificDate(startDateTime.toLocalDate());
            availability.setStartTime(startDateTime.toLocalTime());
            availability.setEndTime(endDateTime.toLocalTime());
        }
        
        return availability;
    }
    
    /**
     * Convertit une date iCal4j (net.fortuna.ical4j.model.Date) en LocalDateTime
     */
    private LocalDateTime convertIcalDate(net.fortuna.ical4j.model.Date icalDate) {
        if (icalDate == null) {
            return null;
        }
        
        try {
            // Convertir en java.util.Date puis en LocalDateTime
            Date javaDate = new Date(icalDate.getTime());
            return javaDate.toInstant().atZone(DEFAULT_TIMEZONE).toLocalDateTime();
        } catch (Exception e) {
            logger.warn("Impossible de convertir la date iCal: {}", icalDate, e);
            return null;
        }
    }
    
    /**
     * Vérifie si l'événement est un événement sur toute la journée
     */
    private boolean isAllDayEvent(DtStart dtStart) {
        if (dtStart == null) return false;
        
        // Un événement "toute la journée" a généralement une date sans heure
        String value = dtStart.getValue();
        return value != null && value.length() == 8; // Format YYYYMMDD
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
     * Tronque la raison si elle est trop longue
     */
    private String truncateReason(String reason) {
        if (reason == null) return null;
        return reason.length() > 250 ? reason.substring(0, 250) + "..." : reason;
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
