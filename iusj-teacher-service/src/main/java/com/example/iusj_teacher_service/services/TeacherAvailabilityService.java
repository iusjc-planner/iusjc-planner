package com.example.iusj_teacher_service.services;

import com.example.iusj_teacher_service.entities.TeacherAvailability;
import com.example.iusj_teacher_service.entities.TeacherAvailability.AvailabilityStatus;
import com.example.iusj_teacher_service.entities.TeacherAvailability.AvailabilityType;
import com.example.iusj_teacher_service.repository.TeacherAvailabilityRepository;
import com.example.iusj_teacher_service.repository.TeacherRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service pour gérer les disponibilités des enseignants
 */
@Service
@Transactional
public class TeacherAvailabilityService {

    private final TeacherAvailabilityRepository availabilityRepository;
    private final TeacherRepository teacherRepository;

    public TeacherAvailabilityService(
            TeacherAvailabilityRepository availabilityRepository,
            TeacherRepository teacherRepository) {
        this.availabilityRepository = availabilityRepository;
        this.teacherRepository = teacherRepository;
    }

    /**
     * Récupère toutes les disponibilités d'un enseignant
     */
    public List<TeacherAvailability> getAvailabilitiesByTeacherId(Long teacherId) {
        validateTeacherExists(teacherId);
        return availabilityRepository.findByTeacherId(teacherId);
    }

    /**
     * Récupère les disponibilités récurrentes (hebdomadaires) d'un enseignant
     */
    public List<TeacherAvailability> getWeeklyAvailabilities(Long teacherId) {
        validateTeacherExists(teacherId);
        return availabilityRepository.findByTeacherIdAndAvailabilityType(
            teacherId, AvailabilityType.WEEKLY_RECURRING
        );
    }

    /**
     * Récupère les indisponibilités ponctuelles d'un enseignant
     */
    public List<TeacherAvailability> getSpecificDateUnavailabilities(Long teacherId) {
        validateTeacherExists(teacherId);
        List<TeacherAvailability> specific = availabilityRepository.findByTeacherIdAndAvailabilityType(
            teacherId, AvailabilityType.SPECIFIC_DATE
        );
        List<TeacherAvailability> ranges = availabilityRepository.findByTeacherIdAndAvailabilityType(
            teacherId, AvailabilityType.DATE_RANGE
        );
        
        List<TeacherAvailability> combined = new ArrayList<>(specific);
        combined.addAll(ranges);
        return combined;
    }

    /**
     * Récupère la grille de disponibilités hebdomadaires formatée
     * Format: { dayOfWeek (1-6) -> { "HH:mm-HH:mm" -> "status" } }
     */
    public Map<Integer, Map<String, String>> getWeeklyAvailabilityGrid(Long teacherId) {
        validateTeacherExists(teacherId);
        
        // Initialiser la grille (Lundi à Samedi, créneaux de 8h à 17h)
        Map<Integer, Map<String, String>> grid = new HashMap<>();
        String[] timeSlots = {
            "08:00-09:00", "09:00-10:00", "10:00-11:00", "11:00-12:00",
            "12:00-13:00", "13:00-14:00", "14:00-15:00", "15:00-16:00", "16:00-17:00"
        };
        
        // Initialiser tous les créneaux comme "available" par défaut
        for (int day = 1; day <= 6; day++) {
            Map<String, String> daySlots = new HashMap<>();
            for (String slot : timeSlots) {
                // 12:00-13:00 est marqué comme pause déjeuner
                if ("12:00-13:00".equals(slot)) {
                    daySlots.put(slot, "break");
                } else {
                    daySlots.put(slot, "available");
                }
            }
            grid.put(day, daySlots);
        }
        
        // Appliquer les disponibilités stockées
        List<TeacherAvailability> availabilities = availabilityRepository.findByTeacherId(teacherId);
        for (TeacherAvailability av : availabilities) {
            if (av.getAvailabilityType() == AvailabilityType.WEEKLY_RECURRING && av.getDayOfWeek() != null) {
                Map<String, String> daySlots = grid.get(av.getDayOfWeek());
                if (daySlots != null) {
                    String slotKey = formatTimeSlot(av.getStartTime(), av.getEndTime());
                    String statusValue = mapStatusToGridValue(av.getStatus());
                    daySlots.put(slotKey, statusValue);
                }
            }
        }
        
        return grid;
    }

    /**
     * Crée une nouvelle disponibilité
     */
    public TeacherAvailability createAvailability(TeacherAvailability availability) {
        validateTeacherExists(availability.getTeacherId());
        validateAvailability(availability);
        return availabilityRepository.save(availability);
    }

    /**
     * Met à jour une disponibilité existante
     */
    public Optional<TeacherAvailability> updateAvailability(Long id, TeacherAvailability payload) {
        return availabilityRepository.findById(id).map(existing -> {
            existing.setAvailabilityType(payload.getAvailabilityType());
            existing.setStatus(payload.getStatus());
            existing.setDayOfWeek(payload.getDayOfWeek());
            existing.setStartTime(payload.getStartTime());
            existing.setEndTime(payload.getEndTime());
            existing.setSpecificDate(payload.getSpecificDate());
            existing.setEndDate(payload.getEndDate());
            existing.setReason(payload.getReason());
            return availabilityRepository.save(existing);
        });
    }

    /**
     * Supprime une disponibilité
     */
    public void deleteAvailability(Long id) {
        availabilityRepository.deleteById(id);
    }

    /**
     * Supprime toutes les disponibilités importées via ICS pour un enseignant
     */
    public void deleteIcsImportedAvailabilities(Long teacherId) {
        validateTeacherExists(teacherId);
        availabilityRepository.deleteIcsImportedByTeacherId(teacherId);
    }

    /**
     * Enregistre plusieurs disponibilités en une seule transaction (pour l'import ICS)
     */
    public List<TeacherAvailability> saveAll(List<TeacherAvailability> availabilities) {
        return availabilityRepository.saveAll(availabilities);
    }

    /**
     * Vérifie si un événement ICS existe déjà
     */
    public boolean icsEventExists(Long teacherId, String icsEventUid) {
        return availabilityRepository.findByTeacherIdAndIcsEventUid(teacherId, icsEventUid).isPresent();
    }

    /**
     * Récupère une disponibilité par son ID
     */
    public Optional<TeacherAvailability> getById(Long id) {
        return availabilityRepository.findById(id);
    }

    /**
     * Vérifie si un enseignant est disponible à une date et heure données
     */
    public boolean isTeacherAvailable(Long teacherId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        validateTeacherExists(teacherId);
        
        int dayOfWeek = date.getDayOfWeek().getValue(); // 1=Monday, 7=Sunday
        
        // Vérifier les indisponibilités ponctuelles
        List<TeacherAvailability> specificUnavailabilities = 
            availabilityRepository.findByTeacherIdAndSpecificDate(teacherId, date);
        for (TeacherAvailability ua : specificUnavailabilities) {
            if (ua.getStatus() == AvailabilityStatus.UNAVAILABLE && 
                timeSlotsOverlap(ua.getStartTime(), ua.getEndTime(), startTime, endTime)) {
                return false;
            }
        }
        
        // Vérifier les plages de dates d'indisponibilité
        List<TeacherAvailability> rangeUnavailabilities = 
            availabilityRepository.findOverlappingDateRanges(teacherId, date, date);
        for (TeacherAvailability ua : rangeUnavailabilities) {
            if (ua.getStatus() == AvailabilityStatus.UNAVAILABLE &&
                timeSlotsOverlap(ua.getStartTime(), ua.getEndTime(), startTime, endTime)) {
                return false;
            }
        }
        
        // Vérifier les disponibilités récurrentes hebdomadaires
        List<TeacherAvailability> weeklyAvailabilities = 
            availabilityRepository.findByTeacherIdAndDayOfWeek(teacherId, dayOfWeek);
        
        // Si aucune disponibilité définie, considéré comme disponible
        if (weeklyAvailabilities.isEmpty()) {
            return true;
        }
        
        // Vérifier si le créneau tombe dans une disponibilité déclarée
        for (TeacherAvailability wa : weeklyAvailabilities) {
            if (wa.getStatus() == AvailabilityStatus.UNAVAILABLE &&
                timeSlotsOverlap(wa.getStartTime(), wa.getEndTime(), startTime, endTime)) {
                return false;
            }
        }
        
        return true;
    }

    // === Méthodes utilitaires privées ===

    private void validateTeacherExists(Long teacherId) {
        if (!teacherRepository.existsById(teacherId)) {
            throw new IllegalArgumentException("Enseignant non trouvé avec l'ID: " + teacherId);
        }
    }

    private void validateAvailability(TeacherAvailability availability) {
        if (availability.getStartTime().isAfter(availability.getEndTime())) {
            throw new IllegalArgumentException("L'heure de début doit être avant l'heure de fin");
        }
        
        if (availability.getAvailabilityType() == AvailabilityType.WEEKLY_RECURRING) {
            if (availability.getDayOfWeek() == null || 
                availability.getDayOfWeek() < 1 || 
                availability.getDayOfWeek() > 7) {
                throw new IllegalArgumentException("Le jour de la semaine doit être entre 1 (Lundi) et 7 (Dimanche)");
            }
        }
        
        if (availability.getAvailabilityType() == AvailabilityType.DATE_RANGE) {
            if (availability.getSpecificDate() == null || availability.getEndDate() == null) {
                throw new IllegalArgumentException("Les dates de début et fin sont requises pour une plage de dates");
            }
            if (availability.getSpecificDate().isAfter(availability.getEndDate())) {
                throw new IllegalArgumentException("La date de début doit être avant la date de fin");
            }
        }
    }

    private boolean timeSlotsOverlap(LocalTime start1, LocalTime end1, LocalTime start2, LocalTime end2) {
        return start1.isBefore(end2) && start2.isBefore(end1);
    }

    private String formatTimeSlot(LocalTime startTime, LocalTime endTime) {
        return String.format("%02d:%02d-%02d:%02d", 
            startTime.getHour(), startTime.getMinute(),
            endTime.getHour(), endTime.getMinute());
    }

    private String mapStatusToGridValue(AvailabilityStatus status) {
        return switch (status) {
            case AVAILABLE -> "available";
            case UNAVAILABLE -> "unavailable";
            case PREFERRED -> "preferred";
        };
    }
}
