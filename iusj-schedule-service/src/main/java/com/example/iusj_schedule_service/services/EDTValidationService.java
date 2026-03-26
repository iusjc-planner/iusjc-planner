package com.example.iusj_schedule_service.services;

import com.example.iusj_schedule_service.dto.ValidationReport;
import com.example.iusj_schedule_service.entities.EDT;
import com.example.iusj_schedule_service.entities.ScheduleEntry;
import com.example.iusj_schedule_service.repositories.ScheduleEntryRepository;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class EDTValidationService {

    private final ScheduleEntryRepository scheduleEntryRepository;
    private final ScheduleService scheduleService;
    private final TeacherAvailabilityClient teacherAvailabilityClient;

    public EDTValidationService(
            ScheduleEntryRepository scheduleEntryRepository,
            ScheduleService scheduleService,
            TeacherAvailabilityClient teacherAvailabilityClient) {
        this.scheduleEntryRepository = scheduleEntryRepository;
        this.scheduleService = scheduleService;
        this.teacherAvailabilityClient = teacherAvailabilityClient;
    }

    public ValidationReport generateReport(EDT edt) {
        ValidationReport report = new ValidationReport();
        report.setEdtId(edt.getId());

        List<ScheduleEntry> entries = scheduleEntryRepository.findByEdt_IdOrderByStartTimeAsc(edt.getId());

        validateMissingCourses(entries, report);
        validateConflicts(entries, report);
        validateCapacity(entries, report);
        validateTeacherAvailability(entries, report);
        validateCoverage(entries, report);

        report.setStatus(report.isValid() ? ValidationReport.ValidationStatus.VALID : ValidationReport.ValidationStatus.INVALID);
        if (report.isValid()) {
            report.setValidatedAt(java.time.LocalDateTime.now());
        }
        return report;
    }

    private void validateMissingCourses(List<ScheduleEntry> entries, ValidationReport report) {
        if (entries.isEmpty()) {
            report.getErrors().add(new ValidationReport.ValidationIssue(
                    "MISSING_COURSE",
                    "Aucun cours planifie pour cet EDT",
                    List.of()
            ));
        }
    }

    private void validateConflicts(List<ScheduleEntry> entries, ValidationReport report) {
        for (ScheduleEntry entry : entries) {
            List<String> conflicts = scheduleService.validateConflicts(entry, entry.getId());
            for (String conflict : conflicts) {
                report.getErrors().add(new ValidationReport.ValidationIssue(
                        "CONFLICT",
                        conflict,
                        List.of(entry.getId())
                ));
            }
        }
    }

    private void validateCapacity(List<ScheduleEntry> entries, ValidationReport report) {
        for (ScheduleEntry entry : entries) {
            ScheduleService.CapacityValidationResult capacity =
                    scheduleService.validateCapacity(entry.getRoomId(), entry.getGroupId());

            if (capacity.errorMessage() != null) {
                report.getErrors().add(new ValidationReport.ValidationIssue(
                        "CAPACITY_ERROR",
                        capacity.errorMessage(),
                        List.of(entry.getId())
                ));
            }
            if (capacity.warningMessage() != null) {
                report.getWarnings().add(new ValidationReport.ValidationIssue(
                        "CAPACITY_WARNING",
                        capacity.warningMessage(),
                        List.of(entry.getId())
                ));
            }
        }
    }

    private void validateTeacherAvailability(List<ScheduleEntry> entries, ValidationReport report) {
        for (ScheduleEntry entry : entries) {
            LocalDate date = entry.getStartTime().toLocalDate();
            boolean available = teacherAvailabilityClient.isAvailable(entry.getTeacherId(), date);
            if (!available) {
                report.getErrors().add(new ValidationReport.ValidationIssue(
                        "TEACHER_UNAVAILABLE",
                        "Indisponibilite enseignant pour la seance " + entry.getId() + " le " + date,
                        List.of(entry.getId())
                ));
            }
        }
    }

    private void validateCoverage(List<ScheduleEntry> entries, ValidationReport report) {
        if (entries.isEmpty()) {
            return;
        }

        List<DayOfWeek> coveredDays = entries.stream()
                .map(e -> e.getStartTime().getDayOfWeek())
                .distinct()
                .sorted(Comparator.naturalOrder())
                .toList();

        List<DayOfWeek> expected = List.of(
                DayOfWeek.MONDAY,
                DayOfWeek.TUESDAY,
                DayOfWeek.WEDNESDAY,
                DayOfWeek.THURSDAY,
                DayOfWeek.FRIDAY
        );

        List<DayOfWeek> missing = new ArrayList<>(expected);
        missing.removeAll(coveredDays);

        if (!missing.isEmpty()) {
            report.getWarnings().add(new ValidationReport.ValidationIssue(
                    "INCOMPLETE_COVERAGE_HORAIRE",
                    "Couverture horaire partielle, jours sans seance: " + missing,
                    List.of()
            ));
        }
    }
}
