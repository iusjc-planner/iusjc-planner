package com.example.schedule.services;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.schedule.algorithm.FordFulkersonScheduler;
import com.example.schedule.algorithm.FordFulkersonScheduler.Assignment;
import com.example.schedule.algorithm.FordFulkersonScheduler.Room;
import com.example.schedule.algorithm.FordFulkersonScheduler.TimeSlot;
import com.example.schedule.dto.GenerationConfigDTO;
import com.example.schedule.dto.GenerationResultDTO;
import com.example.schedule.dto.GenerationResultDTO.GenerationDetailDTO;
import com.example.schedule.entities.ScheduleEntry;
import com.example.schedule.entities.SessionStatus;
import com.example.schedule.repositories.ScheduleEntryRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service de génération automatique de l'emploi du temps
 * utilisant l'algorithme Ford-Fulkerson pour l'attribution optimale des salles.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ScheduleGeneratorService {

    private final ScheduleEntryRepository scheduleRepository;
    private final RestTemplate restTemplate;

    @Value("${services.teacher-service.url:http://localhost:8083}")
    private String teacherServiceUrl;

    @Value("${services.room-service.url:http://localhost:8084}")
    private String roomServiceUrl;

    @Value("${services.course-service.url:http://localhost:8085}")
    private String courseServiceUrl;

    @Value("${services.group-service.url:http://localhost:8088}")
    private String groupServiceUrl;

    /**
     * Génère automatiquement l'emploi du temps en utilisant Ford-Fulkerson
     */
    public GenerationResultDTO generateSchedule(GenerationConfigDTO config) {
        log.info("Démarrage de la génération automatique: {} -> {}", 
                config.getStartDate(), config.getEndDate());

        List<GenerationDetailDTO> details = new ArrayList<>();
        int sessionsCreated = 0;
        int conflicts = 0;
        int noRoomAvailable = 0;

        try {
            // 1. Récupérer les données nécessaires depuis les microservices
            List<TeacherAvailabilityDTO> teacherAvailabilities = fetchTeacherAvailabilities();
            List<RoomDTO> rooms = fetchRooms();
            List<MatiereDTO> matieres = fetchMatieres(config.getSchoolId(), config.getFiliereId());
            List<GroupDTO> groups = fetchGroups(config.getGroupIds());

            if (teacherAvailabilities.isEmpty()) {
                return GenerationResultDTO.builder()
                        .success(false)
                        .message("Aucune disponibilité d'enseignant trouvée")
                        .sessionsCreated(0)
                        .build();
            }

            if (rooms.isEmpty()) {
                return GenerationResultDTO.builder()
                        .success(false)
                        .message("Aucune salle disponible")
                        .sessionsCreated(0)
                        .build();
            }

            // 2. Générer les créneaux possibles pour la période
            List<TimeSlot> slots = generateTimeSlots(
                    config, teacherAvailabilities, matieres, groups);

            // 3. Calculer la disponibilité des salles
            Map<Long, Set<String>> roomAvailability = calculateRoomAvailability(
                    rooms, config.getStartDate(), config.getEndDate(), config);

            // 4. Convertir les salles au format de l'algorithme
            List<Room> algoRooms = rooms.stream()
                    .map(r -> new Room(r.id, r.name, r.capacity, r.type))
                    .collect(Collectors.toList());

            // 5. Exécuter l'algorithme Ford-Fulkerson
            FordFulkersonScheduler scheduler = new FordFulkersonScheduler();
            List<Assignment> assignments = scheduler.findOptimalAssignments(
                    slots, algoRooms, roomAvailability);

            // 6. Créer les entrées dans la base de données
            for (Assignment assignment : assignments) {
                try {
                    ScheduleEntry entry = createScheduleEntry(assignment);
                    scheduleRepository.save(entry);
                    
                    // Mettre à jour la disponibilité de la salle
                    String slotKey = assignment.slot.date + "_" + assignment.slot.startTime;
                    roomAvailability.get(assignment.room.id).remove(slotKey);
                    
                    sessionsCreated++;
                    details.add(GenerationDetailDTO.builder()
                            .matiere(String.valueOf(assignment.slot.matiereId))
                            .teacher(String.valueOf(assignment.slot.teacherId))
                            .group(String.valueOf(assignment.slot.groupId))
                            .room(assignment.room.name)
                            .date(assignment.slot.date)
                            .time(assignment.slot.startTime + " - " + assignment.slot.endTime)
                            .status("created")
                            .build());
                            
                } catch (Exception e) {
                    log.warn("Conflit lors de la création: {}", e.getMessage());
                    conflicts++;
                    details.add(GenerationDetailDTO.builder()
                            .matiere(String.valueOf(assignment.slot.matiereId))
                            .teacher(String.valueOf(assignment.slot.teacherId))
                            .date(assignment.slot.date)
                            .time(assignment.slot.startTime)
                            .status("conflict")
                            .errorMessage(e.getMessage())
                            .build());
                }
            }

            // Compter les créneaux sans salle
            noRoomAvailable = slots.size() - assignments.size();

            log.info("Génération terminée: {} séances créées, {} conflits, {} sans salle",
                    sessionsCreated, conflicts, noRoomAvailable);

            return GenerationResultDTO.builder()
                    .success(true)
                    .message(String.format("Génération terminée: %d séances créées", sessionsCreated))
                    .sessionsCreated(sessionsCreated)
                    .conflicts(conflicts)
                    .noRoomAvailable(noRoomAvailable)
                    .details(details)
                    .build();

        } catch (Exception e) {
            log.error("Erreur lors de la génération", e);
            return GenerationResultDTO.builder()
                    .success(false)
                    .message("Erreur lors de la génération: " + e.getMessage())
                    .sessionsCreated(sessionsCreated)
                    .conflicts(conflicts)
                    .build();
        }
    }

    /**
     * Génère les créneaux horaires possibles basés sur les disponibilités des enseignants
     */
    private List<TimeSlot> generateTimeSlots(
            GenerationConfigDTO config,
            List<TeacherAvailabilityDTO> availabilities,
            List<MatiereDTO> matieres,
            List<GroupDTO> groups) {
        
        List<TimeSlot> slots = new ArrayList<>();
        
        LocalDate current = config.getStartDate();
        while (!current.isAfter(config.getEndDate())) {
            // Exclure les week-ends si configuré
            if (config.isExcludeWeekends() && 
                (current.getDayOfWeek() == DayOfWeek.SATURDAY || 
                 current.getDayOfWeek() == DayOfWeek.SUNDAY)) {
                current = current.plusDays(1);
                continue;
            }
            
            int dayOfWeek = current.getDayOfWeek().getValue();
            
            // Pour chaque matière/enseignant
            for (MatiereDTO matiere : matieres) {
                if (matiere.teacherId == null) continue;
                
                // Trouver les disponibilités de l'enseignant pour ce jour
                List<TeacherAvailabilityDTO> teacherSlots = availabilities.stream()
                        .filter(a -> a.teacherId.equals(matiere.teacherId))
                        .filter(a -> a.dayOfWeek != null && a.dayOfWeek == dayOfWeek)
                        .filter(a -> "AVAILABLE".equals(a.status) || "PREFERRED".equals(a.status))
                        .collect(Collectors.toList());
                
                // Pour chaque groupe associé à cette matière
                List<GroupDTO> relevantGroups = groups.isEmpty() ? 
                        List.of(new GroupDTO(1L, "Default", 30)) : groups;
                
                for (GroupDTO group : relevantGroups) {
                    for (TeacherAvailabilityDTO avail : teacherSlots) {
                        // Générer les créneaux selon la durée configurée
                        LocalTime start = avail.startTime;
                        LocalTime end = avail.endTime;
                        
                        while (start.plusMinutes(config.getSessionDuration()).isBefore(end) ||
                               start.plusMinutes(config.getSessionDuration()).equals(end)) {
                            
                            LocalTime slotEnd = start.plusMinutes(config.getSessionDuration());
                            
                            // Vérifier que le créneau est dans les horaires journaliers
                            if (!start.isBefore(config.getDailyStartTime()) &&
                                !slotEnd.isAfter(config.getDailyEndTime())) {
                                
                                slots.add(new TimeSlot(
                                        matiere.teacherId,
                                        matiere.id,
                                        group.id,
                                        current.toString(),
                                        start.toString(),
                                        slotEnd.toString(),
                                        group.size != null ? group.size : 30
                                ));
                            }
                            
                            // Passer au créneau suivant avec la pause
                            start = slotEnd.plusMinutes(config.getBreakDuration());
                        }
                    }
                }
            }
            
            current = current.plusDays(1);
        }
        
        return slots;
    }

    /**
     * Calcule la disponibilité des salles en vérifiant les réservations existantes
     */
    private Map<Long, Set<String>> calculateRoomAvailability(
            List<RoomDTO> rooms,
            LocalDate startDate,
            LocalDate endDate,
            GenerationConfigDTO config) {
        
        Map<Long, Set<String>> availability = new HashMap<>();
        
        // Récupérer les séances existantes pour la période
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59);
        
        List<ScheduleEntry> existingEntries = scheduleRepository.findAll(
                ScheduleSpecifications.filter(null, null, null, null, null, start, end));
        
        // Créer les créneaux libres pour chaque salle
        for (RoomDTO room : rooms) {
            Set<String> freeSlots = new HashSet<>();
            
            LocalDate current = startDate;
            while (!current.isAfter(endDate)) {
                if (config.isExcludeWeekends() && 
                    (current.getDayOfWeek() == DayOfWeek.SATURDAY || 
                     current.getDayOfWeek() == DayOfWeek.SUNDAY)) {
                    current = current.plusDays(1);
                    continue;
                }
                
                // Générer tous les créneaux possibles pour ce jour
                LocalTime time = config.getDailyStartTime();
                while (time.plusMinutes(config.getSessionDuration())
                        .isBefore(config.getDailyEndTime()) ||
                       time.plusMinutes(config.getSessionDuration())
                        .equals(config.getDailyEndTime())) {
                    
                    String slotKey = current.toString() + "_" + time.toString();
                    
                    // Vérifier si la salle est libre pour ce créneau
                    LocalDateTime slotStart = current.atTime(time);
                    LocalDateTime slotEnd = slotStart.plusMinutes(config.getSessionDuration());
                    
                    final LocalDateTime finalSlotStart = slotStart;
                    final LocalDateTime finalSlotEnd = slotEnd;
                    
                    boolean isFree = existingEntries.stream()
                            .filter(e -> e.getRoomId().equals(String.valueOf(room.id)))
                            .noneMatch(e -> 
                                e.getStartTime().isBefore(finalSlotEnd) && 
                                e.getEndTime().isAfter(finalSlotStart));
                    
                    if (isFree) {
                        freeSlots.add(slotKey);
                    }
                    
                    time = time.plusMinutes(config.getSessionDuration() + config.getBreakDuration());
                }
                
                current = current.plusDays(1);
            }
            
            availability.put(room.id, freeSlots);
        }
        
        return availability;
    }

    private ScheduleEntry createScheduleEntry(Assignment assignment) {
        ScheduleEntry entry = new ScheduleEntry();
        entry.setCourseId(String.valueOf(assignment.slot.matiereId));
        entry.setTeacherId(String.valueOf(assignment.slot.teacherId));
        entry.setGroupId(String.valueOf(assignment.slot.groupId));
        entry.setRoomId(String.valueOf(assignment.room.id));
        
        LocalDate date = LocalDate.parse(assignment.slot.date);
        LocalTime startTime = LocalTime.parse(assignment.slot.startTime);
        LocalTime endTime = LocalTime.parse(assignment.slot.endTime);
        
        entry.setStartTime(LocalDateTime.of(date, startTime));
        entry.setEndTime(LocalDateTime.of(date, endTime));
        entry.setStatus(SessionStatus.SCHEDULED);
        
        return entry;
    }

    // === Méthodes de récupération des données depuis les microservices ===

    @SuppressWarnings("unchecked")
    private List<TeacherAvailabilityDTO> fetchTeacherAvailabilities() {
        try {
            // Simulation - dans un vrai cas, on ferait des appels REST
            // List<Map> response = restTemplate.getForObject(
            //     teacherServiceUrl + "/api/teachers/availabilities", List.class);
            
            // Pour le moment, retourner des données de test
            return generateSampleAvailabilities();
        } catch (Exception e) {
            log.warn("Impossible de récupérer les disponibilités: {}", e.getMessage());
            return generateSampleAvailabilities();
        }
    }

    @SuppressWarnings("unchecked")
    private List<RoomDTO> fetchRooms() {
        try {
            // List<Map> response = restTemplate.getForObject(
            //     roomServiceUrl + "/api/rooms", List.class);
            
            return generateSampleRooms();
        } catch (Exception e) {
            log.warn("Impossible de récupérer les salles: {}", e.getMessage());
            return generateSampleRooms();
        }
    }

    private List<MatiereDTO> fetchMatieres(Long schoolId, Long filiereId) {
        try {
            return generateSampleMatieres();
        } catch (Exception e) {
            log.warn("Impossible de récupérer les matières: {}", e.getMessage());
            return generateSampleMatieres();
        }
    }

    private List<GroupDTO> fetchGroups(List<Long> groupIds) {
        try {
            return generateSampleGroups();
        } catch (Exception e) {
            log.warn("Impossible de récupérer les groupes: {}", e.getMessage());
            return generateSampleGroups();
        }
    }

    // === Données de test ===

    private List<TeacherAvailabilityDTO> generateSampleAvailabilities() {
        List<TeacherAvailabilityDTO> availabilities = new ArrayList<>();
        
        // Enseignant 1: disponible lundi et mercredi matin
        availabilities.add(new TeacherAvailabilityDTO(1L, 1, LocalTime.of(8, 0), LocalTime.of(12, 0), "AVAILABLE"));
        availabilities.add(new TeacherAvailabilityDTO(1L, 3, LocalTime.of(8, 0), LocalTime.of(12, 0), "AVAILABLE"));
        
        // Enseignant 2: disponible mardi et jeudi après-midi
        availabilities.add(new TeacherAvailabilityDTO(2L, 2, LocalTime.of(14, 0), LocalTime.of(18, 0), "AVAILABLE"));
        availabilities.add(new TeacherAvailabilityDTO(2L, 4, LocalTime.of(14, 0), LocalTime.of(18, 0), "AVAILABLE"));
        
        // Enseignant 3: disponible vendredi toute la journée
        availabilities.add(new TeacherAvailabilityDTO(3L, 5, LocalTime.of(8, 0), LocalTime.of(18, 0), "PREFERRED"));
        
        return availabilities;
    }

    private List<RoomDTO> generateSampleRooms() {
        return List.of(
            new RoomDTO(1L, "Salle A101", 40, "CLASSROOM"),
            new RoomDTO(2L, "Salle B202", 30, "CLASSROOM"),
            new RoomDTO(3L, "Labo Info 1", 25, "LAB"),
            new RoomDTO(4L, "Amphi 1", 120, "AUDITORIUM")
        );
    }

    private List<MatiereDTO> generateSampleMatieres() {
        return List.of(
            new MatiereDTO(1L, "Programmation Java", 1L),
            new MatiereDTO(2L, "Base de données", 2L),
            new MatiereDTO(3L, "Réseaux", 3L)
        );
    }

    private List<GroupDTO> generateSampleGroups() {
        return List.of(
            new GroupDTO(1L, "L3 Info - Groupe A", 35),
            new GroupDTO(2L, "L3 Info - Groupe B", 32)
        );
    }

    // === DTOs internes ===

    private static class TeacherAvailabilityDTO {
        Long teacherId;
        Integer dayOfWeek;
        LocalTime startTime;
        LocalTime endTime;
        String status;
        
        TeacherAvailabilityDTO(Long teacherId, Integer dayOfWeek, 
                              LocalTime startTime, LocalTime endTime, String status) {
            this.teacherId = teacherId;
            this.dayOfWeek = dayOfWeek;
            this.startTime = startTime;
            this.endTime = endTime;
            this.status = status;
        }
    }

    private static class RoomDTO {
        Long id;
        String name;
        int capacity;
        String type;
        
        RoomDTO(Long id, String name, int capacity, String type) {
            this.id = id;
            this.name = name;
            this.capacity = capacity;
            this.type = type;
        }
    }

    private static class MatiereDTO {
        Long id;
        String nom;
        Long teacherId;
        
        MatiereDTO(Long id, String nom, Long teacherId) {
            this.id = id;
            this.nom = nom;
            this.teacherId = teacherId;
        }
    }

    private static class GroupDTO {
        Long id;
        String name;
        Integer size;
        
        GroupDTO(Long id, String name, Integer size) {
            this.id = id;
            this.name = name;
            this.size = size;
        }
    }
}
