package com.example.iusj_event_service.services;

import com.example.iusj_event_service.entities.Evenement;
import com.example.iusj_event_service.repositories.EvenementRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class EvenementService {

    private final EvenementRepository evenementRepository;
    private final RoomClient roomClient;
    private final NotificationClient notificationClient;

    public List<Evenement> getAll(
            LocalDate date,
            LocalDate from,
            LocalDate to,
            Evenement.EventType type,
            Long salleId,
            Evenement.EventStatus status,
            Long organisateurId) {
        Specification<Evenement> specification = EvenementSpecifications.withFilters(
            date, from, to, type, salleId, status, organisateurId
        );
        return evenementRepository.findAll(specification, Sort.by(Sort.Direction.ASC, "date").and(Sort.by("heureDebut")));
    }

    @Transactional(readOnly = true)
    public Evenement getById(Long id) {
        return evenementRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Evenement introuvable: " + id));
    }

    @Transactional(readOnly = true)
    public List<Evenement> getByDate(LocalDate date) {
        return evenementRepository.findByDate(date);
    }

    @Transactional(readOnly = true)
    public List<Evenement> getByDateRange(LocalDate from, LocalDate to) {
        return evenementRepository.findByDateBetween(from, to);
    }

    @Transactional(readOnly = true)
    public List<Evenement> getBySalle(Long salleId) {
        return evenementRepository.findBySalleId(salleId);
    }

    public Evenement create(Evenement event, Long userId, String role) {
        enforceCreatePermission(event, userId, role);
        validateEvent(event);

        if (!checkSalleAvailability(event.getSalleId(), event.getDate(), event.getHeureDebut(), event.getDuree(), null)) {
            throw new IllegalArgumentException("Salle indisponible pour ce creneau");
        }

        event.setId(null);
        if (event.getStatus() == null) {
            event.setStatus(Evenement.EventStatus.PLANIFIE);
        }
        Long reservationId = roomClient.reserveRoom(
            event.getSalleId(),
            event.getDate(),
            event.getHeureDebut(),
            event.getDuree(),
            event.getOrganisateurId(),
            "Evenement: " + event.getNom()
        );
        event.setRoomReservationId(reservationId);

        Evenement saved = evenementRepository.save(event);
        notificationClient.notifyParticipants(
            saved.getParticipantIds(),
            "Nouvel evenement: " + saved.getNom() + " le " + saved.getDate() + " a " + saved.getHeureDebut(),
            saved.getId(),
            userId
        );
        return saved;
    }

    public Evenement update(Long id, Evenement event, Long userId, String role) {
        Evenement existing = getById(id);
        enforceEditPermission(existing, event, userId, role);
        validateEvent(event);

        boolean hasScheduleChange = !sameSchedule(existing, event);
        if (hasScheduleChange) {
            if (!checkSalleAvailability(event.getSalleId(), event.getDate(), event.getHeureDebut(), event.getDuree(), id)) {
                throw new IllegalArgumentException("Salle indisponible pour ce creneau");
            }
            roomClient.cancelReservation(existing.getSalleId(), existing.getRoomReservationId());
            Long reservationId = roomClient.reserveRoom(
                event.getSalleId(),
                event.getDate(),
                event.getHeureDebut(),
                event.getDuree(),
                event.getOrganisateurId(),
                "Evenement: " + event.getNom()
            );
            event.setRoomReservationId(reservationId);
        } else {
            event.setRoomReservationId(existing.getRoomReservationId());
        }

        event.setId(id);
        Evenement saved = evenementRepository.save(event);

        notificationClient.notifyParticipants(
            saved.getParticipantIds(),
            "Mise a jour evenement: " + saved.getNom() + " le " + saved.getDate() + " a " + saved.getHeureDebut(),
            saved.getId(),
            userId
        );
        return saved;
    }

    public Evenement cancel(Long id, Long userId, String role) {
        Evenement existing = getById(id);
        enforceEditPermission(existing, existing, userId, role);

        existing.setStatus(Evenement.EventStatus.ANNULE);
        roomClient.cancelReservation(existing.getSalleId(), existing.getRoomReservationId());

        Evenement saved = evenementRepository.save(existing);
        notificationClient.notifyParticipants(
            saved.getParticipantIds(),
            "Evenement annule: " + saved.getNom() + " le " + saved.getDate() + " a " + saved.getHeureDebut(),
            saved.getId(),
            userId
        );
        return saved;
    }

    public void delete(Long id, Long userId, String role) {
        Evenement existing = getById(id);
        enforceEditPermission(existing, existing, userId, role);
        roomClient.cancelReservation(existing.getSalleId(), existing.getRoomReservationId());
        evenementRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public boolean checkSalleAvailability(Long salleId, LocalDate date, LocalTime heure, Integer duree, Long excludeEventId) {
        if (salleId == null) {
            return true;
        }
        if (!roomClient.isRoomActive(salleId)) {
            return false;
        }

        List<Evenement> sameDayEvents = evenementRepository.findBySalleIdAndDate(salleId, date).stream()
            .filter(e -> e.getStatus() != Evenement.EventStatus.ANNULE)
            .filter(e -> excludeEventId == null || !excludeEventId.equals(e.getId()))
            .toList();

        LocalDateTime start = LocalDateTime.of(date, heure);
        LocalDateTime end = start.plusMinutes(duree);

        boolean hasOverlap = sameDayEvents.stream().anyMatch(other -> {
            LocalDateTime otherStart = LocalDateTime.of(other.getDate(), other.getHeureDebut());
            LocalDateTime otherEnd = otherStart.plusMinutes(other.getDuree());
            return start.isBefore(otherEnd) && end.isAfter(otherStart);
        });

        if (hasOverlap) {
            return false;
        }
        return roomClient.isRoomAvailable(salleId, date, heure, duree);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> stats() {
        List<Evenement> events = evenementRepository.findAll();

        Map<Evenement.EventStatus, Long> byStatus = new EnumMap<>(Evenement.EventStatus.class);
        for (Evenement.EventStatus status : Evenement.EventStatus.values()) {
            long count = events.stream().filter(e -> status == e.getStatus()).count();
            byStatus.put(status, count);
        }

        Map<Evenement.EventType, Long> byType = new EnumMap<>(Evenement.EventType.class);
        for (Evenement.EventType type : Evenement.EventType.values()) {
            long count = events.stream().filter(e -> type == e.getType()).count();
            byType.put(type, count);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", events.size());
        result.put("byStatus", byStatus);
        result.put("byType", byType);
        return result;
    }

    private void validateEvent(Evenement event) {
        if (event.getDate() == null || event.getHeureDebut() == null || event.getDuree() == null || event.getDuree() < 15) {
            throw new IllegalArgumentException("Date, heureDebut et duree valide sont requis");
        }
        if (event.getOrganisateurId() == null) {
            throw new IllegalArgumentException("organisateurId est requis");
        }
    }

    private boolean sameSchedule(Evenement left, Evenement right) {
        return equalsNullable(left.getSalleId(), right.getSalleId())
            && equalsNullable(left.getDate(), right.getDate())
            && equalsNullable(left.getHeureDebut(), right.getHeureDebut())
            && equalsNullable(left.getDuree(), right.getDuree());
    }

    private boolean equalsNullable(Object left, Object right) {
        if (left == null) {
            return right == null;
        }
        return left.equals(right);
    }

    private void enforceCreatePermission(Evenement event, Long userId, String role) {
        if (isAdmin(role)) {
            return;
        }
        if (isTeacher(role)
                && isTeacherAllowedType(event.getType())
                && userId != null
                && userId.equals(event.getOrganisateurId())) {
            return;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Permissions insuffisantes pour creer cet evenement");
    }

    private void enforceEditPermission(Evenement existing, Evenement incoming, Long userId, String role) {
        if (isAdmin(role)) {
            return;
        }
        if (isTeacher(role)
                && isTeacherAllowedType(incoming.getType())
                && userId != null
                && userId.equals(existing.getOrganisateurId())) {
            return;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Permissions insuffisantes pour modifier cet evenement");
    }

    private boolean isAdmin(String role) {
        return role != null && "ADMIN".equalsIgnoreCase(role);
    }

    private boolean isTeacher(String role) {
        return role != null && "ENSEIGNANT".equalsIgnoreCase(role);
    }

    private boolean isTeacherAllowedType(Evenement.EventType type) {
        return type == Evenement.EventType.REUNION || type == Evenement.EventType.SOUTENANCE;
    }
}
