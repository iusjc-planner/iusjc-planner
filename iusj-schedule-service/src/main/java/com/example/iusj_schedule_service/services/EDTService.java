package com.example.iusj_schedule_service.services;

import com.example.iusj_schedule_service.entities.EDT;
import com.example.iusj_schedule_service.entities.ScheduleEntry;
import com.example.iusj_schedule_service.repositories.EDTRepository;
import com.example.iusj_schedule_service.repositories.ScheduleEntryRepository;
import com.example.iusj_schedule_service.services.export.PdfExportService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    private final EDTRepository edtRepository;
    private final ScheduleEntryRepository scheduleEntryRepository;
    private final ScheduleService scheduleService;
    private final PdfExportService pdfExportService;

    public EDTService(
            EDTRepository edtRepository,
            ScheduleEntryRepository scheduleEntryRepository,
            ScheduleService scheduleService,
            PdfExportService pdfExportService) {
        this.edtRepository = edtRepository;
        this.scheduleEntryRepository = scheduleEntryRepository;
        this.scheduleService = scheduleService;
        this.pdfExportService = pdfExportService;
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

        if (semaine != null && annee != null && vue != null && targetId != null) {
            return edtRepository.findBySemaineAndAnneeAndVueAndTargetId(semaine, annee, vue, targetId)
                .stream().toList();
        }
        if (semaine != null && annee != null) {
            return edtRepository.findBySemaineAndAnnee(semaine, annee);
        }
        if (vue != null && targetId != null) {
            return edtRepository.findByVueAndTargetId(vue, targetId);
        }
        if (status != null) {
            return edtRepository.findByStatus(status);
        }
        if (periode != null && annee != null) {
            return edtRepository.findByPeriodeAndAnnee(periode, annee);
        }
        return edtRepository.findAll();
    }

    public Optional<EDT> getById(Long id) {
        return edtRepository.findById(id);
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
        return scheduleEntryRepository.findByEdtIdOrderByStartTimeAsc(edtId);
    }

    public ScheduleEntry addEntry(Long edtId, ScheduleEntry entry) {
        EDT edt = edtRepository.findById(edtId)
            .orElseThrow(() -> new EntityNotFoundException("EDT introuvable: " + edtId));

        entry.setEdt(edt);
        return scheduleService.create(entry);
    }

    public EDT validate(Long edtId) {
        EDT edt = edtRepository.findById(edtId)
            .orElseThrow(() -> new EntityNotFoundException("EDT introuvable: " + edtId));

        List<ScheduleEntry> entries = scheduleEntryRepository.findByEdtIdOrderByStartTimeAsc(edtId);
        for (ScheduleEntry entry : entries) {
            List<String> conflicts = scheduleService.validateConflicts(entry, entry.getId());
            if (!conflicts.isEmpty()) {
                throw new IllegalStateException("Conflits detectes: " + String.join("; ", conflicts));
            }
        }

        edt.setStatus(EDT.EDTStatus.VALIDATED);
        return edtRepository.save(edt);
    }

    public EDT publish(Long edtId) {
        EDT edt = edtRepository.findById(edtId)
            .orElseThrow(() -> new EntityNotFoundException("EDT introuvable: " + edtId));

        if (edt.getStatus() == EDT.EDTStatus.DRAFT) {
            throw new IllegalStateException("Validation requise avant publication");
        }

        edt.setStatus(EDT.EDTStatus.PUBLISHED);
        edt.setDatePublication(LocalDateTime.now());
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

        List<ScheduleEntry> entries = scheduleEntryRepository.findByEdtIdOrderByStartTimeAsc(edtId);
        return aggregateByDay(entries, edt.getAnnee(), edt.getSemaine());
    }

    public byte[] exportPdfByEdtId(Long edtId) {
        EDT edt = edtRepository.findById(edtId)
            .orElseThrow(() -> new EntityNotFoundException("EDT introuvable: " + edtId));
        List<ScheduleEntry> entries = scheduleEntryRepository.findByEdtIdOrderByStartTimeAsc(edtId);
        return pdfExportService.exportWeeklyEdtPdf(edt, entries);
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
        result.put("meta", List.of());
        return result;
    }
}
