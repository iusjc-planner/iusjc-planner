package com.example.iusj_schedule_service.services;

import com.example.iusj_schedule_service.dto.EDTExportData;
import com.example.iusj_schedule_service.dto.ValidationReport;
import com.example.iusj_schedule_service.entities.EDT;
import com.example.iusj_schedule_service.entities.ScheduleEntry;
import com.example.iusj_schedule_service.repositories.EDTRepository;
import com.example.iusj_schedule_service.repositories.ScheduleEntryRepository;
import com.example.iusj_schedule_service.services.export.ExcelExportService;
import com.example.iusj_schedule_service.services.export.PdfExportService;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.WeekFields;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class EDTService {

    private static final Logger log = LoggerFactory.getLogger(EDTService.class);

    private final EDTRepository edtRepository;
    private final ScheduleEntryRepository scheduleEntryRepository;
    private final ScheduleService scheduleService;
    private final EDTValidationService edtValidationService;
    private final RestTemplate restTemplate;
    private final PdfExportService pdfExportService;
    private final ExcelExportService excelExportService;

    public EDTService(
            EDTRepository edtRepository,
            ScheduleEntryRepository scheduleEntryRepository,
            ScheduleService scheduleService,
            EDTValidationService edtValidationService,
            RestTemplate restTemplate,
            PdfExportService pdfExportService,
            ExcelExportService excelExportService) {
        this.edtRepository = edtRepository;
        this.scheduleEntryRepository = scheduleEntryRepository;
        this.scheduleService = scheduleService;
        this.edtValidationService = edtValidationService;
        this.restTemplate = restTemplate;
        this.pdfExportService = pdfExportService;
        this.excelExportService = excelExportService;
    }

    public EDT getOrCreate(Integer semaine, Integer annee, EDT.VueType vue, Long targetId, Long creePar) {
        return edtRepository.findBySemaineAndAnneeAndVueAndTargetId(semaine, annee, vue, targetId)
            .orElseGet(() -> {
                EDT edt = new EDT();
                edt.setSemaine(semaine);
                edt.setAnnee(annee);
                edt.setVue(vue);
                edt.setTargetId(targetId);
                edt.setCreePar(creePar);
                edt.setPeriode(inferPeriode(semaine));
                edt.setStatus(EDT.EDTStatus.DRAFT);
                return edtRepository.save(edt);
            });
    }

    public List<EDT> list(
            Integer semaine,
            Integer annee,
            EDT.VueType vue,
            Long targetId,
            EDT.EDTStatus status,
            EDT.PeriodeType periode) {
        return list(semaine, annee, vue, targetId, status, periode, null, null);
        }

        public List<EDT> list(
            Integer semaine,
            Integer annee,
            EDT.VueType vue,
            Long targetId,
            EDT.EDTStatus status,
            EDT.PeriodeType periode,
            String userRole,
            Long userId) {

        if (semaine != null && annee != null && vue != null && targetId != null) {
            return edtRepository.findBySemaineAndAnneeAndVueAndTargetId(semaine, annee, vue, targetId)
                .stream()
                .filter(edt -> canView(edt, userRole, userId))
                .toList();
        }
        if (semaine != null && annee != null) {
            return edtRepository.findBySemaineAndAnnee(semaine, annee).stream()
                    .filter(edt -> canView(edt, userRole, userId))
                    .toList();
        }
        if (vue != null && targetId != null) {
            return edtRepository.findByVueAndTargetId(vue, targetId).stream()
                    .filter(edt -> canView(edt, userRole, userId))
                    .toList();
        }
        if (status != null) {
            return edtRepository.findByStatus(status).stream()
                    .filter(edt -> canView(edt, userRole, userId))
                    .toList();
        }
        if (periode != null && annee != null) {
            return edtRepository.findByPeriodeAndAnnee(periode, annee).stream()
                    .filter(edt -> canView(edt, userRole, userId))
                    .toList();
        }
        return edtRepository.findAll().stream()
                .filter(edt -> canView(edt, userRole, userId))
                .toList();
    }

    public Optional<EDT> getById(Long id) {
        return edtRepository.findById(id);
    }

    public Optional<EDT> getByIdVisible(Long id, String userRole, Long userId) {
        return edtRepository.findById(id)
                .filter(edt -> canView(edt, userRole, userId));
    }

    public Optional<EDT> getByGroupe(Long groupeId, Integer semaine, Integer annee) {
        return edtRepository.findBySemaineAndAnneeAndVueAndTargetId(semaine, annee, EDT.VueType.GROUPE, groupeId);
    }

    public Optional<EDT> getByEnseignant(Long enseignantId, Integer semaine, Integer annee) {
        return edtRepository.findBySemaineAndAnneeAndVueAndTargetId(semaine, annee, EDT.VueType.ENSEIGNANT, enseignantId);
    }

    public Optional<EDT> getBySalle(Long salleId, Integer semaine, Integer annee) {
        return edtRepository.findBySemaineAndAnneeAndVueAndTargetId(semaine, annee, EDT.VueType.SALLE, salleId);
    }

    public EDT create(EDT edt) {
        if (edt.getPeriode() == null && edt.getSemaine() != null) {
            edt.setPeriode(inferPeriode(edt.getSemaine()));
        }
        if (edt.getStatus() == null) {
            edt.setStatus(EDT.EDTStatus.DRAFT);
        }
        return edtRepository.save(edt);
    }

    public List<ScheduleEntry> getEntries(Long edtId) {
        return scheduleEntryRepository.findByEdt_IdOrderByStartTimeAsc(edtId);
    }

    public ScheduleEntry addEntry(Long edtId, ScheduleEntry entry) {
        EDT edt = edtRepository.findById(edtId)
            .orElseThrow(() -> new EntityNotFoundException("EDT introuvable: " + edtId));

        entry.setEdt(edt);
        return scheduleService.create(entry);
    }

    public ValidationReport validate(Long edtId) {
        EDT edt = edtRepository.findById(edtId)
            .orElseThrow(() -> new EntityNotFoundException("EDT introuvable: " + edtId));

        if (edt.getStatus() == EDT.EDTStatus.PUBLISHED || edt.getStatus() == EDT.EDTStatus.ARCHIVED) {
            throw new IllegalStateException("Validation impossible pour un EDT deja publie/archive");
        }

        ValidationReport report = edtValidationService.generateReport(edt);
        if (report.isValid()) {
            edt.setStatus(EDT.EDTStatus.VALIDATED);
            edtRepository.save(edt);
        }
        return report;
    }

    public ValidationReport getValidationReport(Long edtId) {
        EDT edt = edtRepository.findById(edtId)
                .orElseThrow(() -> new EntityNotFoundException("EDT introuvable: " + edtId));
        return edtValidationService.generateReport(edt);
    }

    public EDT publish(Long edtId) {
        EDT edt = edtRepository.findById(edtId)
            .orElseThrow(() -> new EntityNotFoundException("EDT introuvable: " + edtId));

        if (edt.getStatus() != EDT.EDTStatus.VALIDATED) {
            throw new IllegalStateException("Validation requise avant publication");
        }

        edt.setStatus(EDT.EDTStatus.PUBLISHED);
        edt.setDatePublication(LocalDateTime.now());
        EDT published = edtRepository.save(edt);
        notifyPublication(published);
        return published;
    }

    public EDT unpublish(Long edtId) {
        EDT edt = edtRepository.findById(edtId)
                .orElseThrow(() -> new EntityNotFoundException("EDT introuvable: " + edtId));

        if (edt.getStatus() != EDT.EDTStatus.PUBLISHED) {
            throw new IllegalStateException("Seul un EDT publie peut etre depublie");
        }

        edt.setStatus(EDT.EDTStatus.VALIDATED);
        return edtRepository.save(edt);
    }

    public EDT archive(Long edtId) {
        EDT edt = edtRepository.findById(edtId)
                .orElseThrow(() -> new EntityNotFoundException("EDT introuvable: " + edtId));

        if (edt.getStatus() != EDT.EDTStatus.PUBLISHED) {
            throw new IllegalStateException("Seul un EDT publie peut etre archive");
        }

        edt.setStatus(EDT.EDTStatus.ARCHIVED);
        return edtRepository.save(edt);
    }

    public void delete(Long edtId) {
        if (!edtRepository.existsById(edtId)) {
            throw new EntityNotFoundException("EDT introuvable: " + edtId);
        }
        edtRepository.deleteById(edtId);
    }

    public Map<String, List<ScheduleEntry>> weeklyView(Long edtId) {
        EDT edt = edtRepository.findById(edtId)
            .orElseThrow(() -> new EntityNotFoundException("EDT introuvable: " + edtId));

        List<ScheduleEntry> entries = scheduleEntryRepository.findByEdt_IdOrderByStartTimeAsc(edtId);
        return aggregateByDay(entries, edt.getAnnee(), edt.getSemaine());
    }

    public byte[] exportPdfByEdtId(Long edtId) {
        EDT edt = edtRepository.findById(edtId)
            .orElseThrow(() -> new EntityNotFoundException("EDT introuvable: " + edtId));
        List<ScheduleEntry> entries = scheduleEntryRepository.findByEdt_IdOrderByStartTimeAsc(edtId);
        return pdfExportService.exportWeeklyEdtPdf(edt, entries);
    }

    public byte[] exportExcelByEdtId(Long edtId) {
        EDT edt = edtRepository.findById(edtId)
            .orElseThrow(() -> new EntityNotFoundException("EDT introuvable: " + edtId));
        List<ScheduleEntry> entries = scheduleEntryRepository.findByEdt_IdOrderByStartTimeAsc(edtId);
        EDTExportData exportData = toExportData(edt, entries);
        return excelExportService.exportWeeklyEdtExcel(exportData);
    }

    public byte[] exportPdfForView(EDT.VueType vue, Long targetId, Integer semaine, Integer annee, Long creePar) {
        EDT edt = getOrCreate(semaine, annee, vue, targetId, creePar);

        LocalDate start = isoWeekStart(annee, semaine);
        LocalDateTime from = start.atStartOfDay();
        LocalDateTime to = start.plusDays(6).atTime(23, 59, 59);

        List<ScheduleEntry> entries = switch (vue) {
            case GROUPE -> scheduleEntryRepository.findByGroupIdAndStartTimeBetweenOrderByStartTimeAsc(targetId, from, to);
            case ENSEIGNANT -> scheduleEntryRepository.findByTeacherIdAndStartTimeBetweenOrderByStartTimeAsc(targetId, from, to);
            case SALLE -> scheduleEntryRepository.findByRoomIdAndStartTimeBetweenOrderByStartTimeAsc(targetId, from, to);
        };

        return pdfExportService.exportWeeklyEdtPdf(edt, entries);
    }

    public byte[] exportExcelForView(EDT.VueType vue, Long targetId, Integer semaine, Integer annee, Long creePar) {
        EDT edt = getOrCreate(semaine, annee, vue, targetId, creePar);

        LocalDate start = isoWeekStart(annee, semaine);
        LocalDateTime from = start.atStartOfDay();
        LocalDateTime to = start.plusDays(6).atTime(23, 59, 59);

        List<ScheduleEntry> entries = switch (vue) {
            case GROUPE -> scheduleEntryRepository.findByGroupIdAndStartTimeBetweenOrderByStartTimeAsc(targetId, from, to);
            case ENSEIGNANT -> scheduleEntryRepository.findByTeacherIdAndStartTimeBetweenOrderByStartTimeAsc(targetId, from, to);
            case SALLE -> scheduleEntryRepository.findByRoomIdAndStartTimeBetweenOrderByStartTimeAsc(targetId, from, to);
        };

        EDTExportData exportData = toExportData(edt, entries);
        return excelExportService.exportWeeklyEdtExcel(exportData);
    }

    private EDTExportData toExportData(EDT edt, List<ScheduleEntry> entries) {
        List<EDTExportData.ExportEntry> exportEntries = entries.stream()
            .map(entry -> EDTExportData.ExportEntry.builder()
                .courseId(entry.getCourseId())
                .teacherId(entry.getTeacherId())
                .roomId(entry.getRoomId())
                .groupId(entry.getGroupId())
                .startTime(entry.getStartTime())
                .endTime(entry.getEndTime())
                .status(entry.getStatus() == null ? null : entry.getStatus().name())
                .build())
            .toList();

        return EDTExportData.builder()
            .edtId(edt.getId())
            .semaine(edt.getSemaine())
            .annee(edt.getAnnee())
            .vue(edt.getVue().name())
            .targetId(edt.getTargetId())
            .generatedBy(edt.getCreePar())
            .generatedAt(LocalDateTime.now())
            .entries(exportEntries)
            .build();
    }

    private EDT.PeriodeType inferPeriode(Integer semaine) {
        if (semaine == null) {
            return EDT.PeriodeType.ANNUEL;
        }
        return semaine <= 26 ? EDT.PeriodeType.SEMESTRE2 : EDT.PeriodeType.SEMESTRE1;
    }

    private LocalDate isoWeekStart(Integer annee, Integer semaine) {
        return LocalDate.now()
            .withYear(annee)
            .with(WeekFields.ISO.weekOfWeekBasedYear(), semaine)
            .with(WeekFields.ISO.dayOfWeek(), 1);
    }

    private Map<String, List<ScheduleEntry>> aggregateByDay(List<ScheduleEntry> entries, Integer annee, Integer semaine) {
        Map<String, List<ScheduleEntry>> result = new HashMap<>();
        result.put("lundi", entries.stream().filter(e -> e.getStartTime().getDayOfWeek().getValue() == 1).toList());
        result.put("mardi", entries.stream().filter(e -> e.getStartTime().getDayOfWeek().getValue() == 2).toList());
        result.put("mercredi", entries.stream().filter(e -> e.getStartTime().getDayOfWeek().getValue() == 3).toList());
        result.put("jeudi", entries.stream().filter(e -> e.getStartTime().getDayOfWeek().getValue() == 4).toList());
        result.put("vendredi", entries.stream().filter(e -> e.getStartTime().getDayOfWeek().getValue() == 5).toList());
        result.put("samedi", entries.stream().filter(e -> e.getStartTime().getDayOfWeek().getValue() == 6).toList());
        result.put("evenements", List.of());
        result.put("meta", List.of());
        return result;
    }

    private boolean canView(EDT edt, String userRole, Long userId) {
        if (edt.getStatus() == EDT.EDTStatus.PUBLISHED) {
            return true;
        }

        String normalizedRole = normalizeRole(userRole);
        boolean isAdmin = "ADMIN".equals(normalizedRole);
        boolean isTeacher = "ENSEIGNANT".equals(normalizedRole);

        if (edt.getStatus() == EDT.EDTStatus.DRAFT) {
            return isAdmin;
        }

        if (edt.getStatus() == EDT.EDTStatus.VALIDATED) {
            if (isAdmin) {
                return true;
            }
            if (isTeacher && userId != null) {
                if (edt.getVue() == EDT.VueType.ENSEIGNANT && userId.equals(edt.getTargetId())) {
                    return true;
                }
                return scheduleEntryRepository.findByEdt_IdOrderByStartTimeAsc(edt.getId()).stream()
                        .anyMatch(entry -> userId.equals(entry.getTeacherId()));
            }
        }

        return false;
    }

    private String normalizeRole(String role) {
        if (role == null) {
            return "";
        }
        return role.toUpperCase().replace("ROLE_", "");
    }

    private void notifyPublication(EDT edt) {
        try {
            Map<String, Object> payload = Map.of(
                    "type", "EDT_PUBLISHED",
                    "message", "Un emploi du temps a ete publie",
                    "title", "Publication EDT",
                    "metadata", Map.of("edtId", edt.getId(), "status", edt.getStatus().name())
            );
            restTemplate.postForEntity("http://iusj-notification-service/api/notifications/broadcast", payload, Void.class);
        } catch (Exception ex) {
            log.warn("Notification publication EDT non envoyee (service indisponible): edtId={}", edt.getId());
        }
    }
}
