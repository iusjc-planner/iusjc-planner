package com.example.iusj_report_service.services;

import com.example.iusj_report_service.config.StorageConfig;
import com.example.iusj_report_service.dto.RapportData;
import com.example.iusj_report_service.dto.RapportRequest;
import com.example.iusj_report_service.entities.Rapport;
import com.example.iusj_report_service.repositories.RapportRepository;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class RapportService {

    private final RapportRepository rapportRepository;
    private final DataAggregationService dataAggregationService;
    private final ExportService exportService;
    private final StorageConfig storageConfig;

    @PostConstruct
    public void initStorage() {
        try {
            Files.createDirectories(Paths.get(storageConfig.getPath()));
        } catch (IOException ex) {
            throw new IllegalStateException("Impossible de creer le dossier de stockage des rapports", ex);
        }
    }

    @Transactional(readOnly = true)
    public List<Rapport> listReports(Rapport.ReportType type, Long generatedBy) {
        if (type != null) {
            return rapportRepository.findByType(type);
        }
        if (generatedBy != null) {
            return rapportRepository.findByGenerePar(generatedBy);
        }
        return rapportRepository.findAll(Sort.by(Sort.Direction.DESC, "dateGeneration"));
    }

    @Transactional(readOnly = true)
    public Rapport getById(Long id) {
        return rapportRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Rapport introuvable: " + id));
    }

    public Rapport generate(RapportRequest request, Long userId) {
        LocalDate from = request.getPeriodeDebut() == null ? LocalDate.now().minusDays(30) : request.getPeriodeDebut();
        LocalDate to = request.getPeriodeFin() == null ? LocalDate.now() : request.getPeriodeFin();

        Rapport rapport = new Rapport();
        rapport.setTitre(buildTitle(request.getType(), from, to));
        rapport.setType(request.getType());
        rapport.setDateGeneration(LocalDateTime.now());
        rapport.setPeriodeDebut(from);
        rapport.setPeriodeFin(to);
        rapport.setGenerePar(userId);
        rapport.setFormat(request.getFormat());
        rapport.setParametres(request.getParams() == null ? "{}" : request.getParams().toString());
        rapport.setStatus(Rapport.ReportStatus.EN_COURS);
        rapport = rapportRepository.save(rapport);

        try {
            RapportData data = generateData(request, userId, from, to);
            byte[] fileContent = switch (request.getFormat()) {
                case PDF -> exportService.exportToPdf(data, "default");
                case EXCEL -> exportService.exportToExcel(data);
                case JSON -> exportService.exportToJson(data);
            };

            String extension = switch (request.getFormat()) {
                case PDF -> ".pdf";
                case EXCEL -> ".xlsx";
                case JSON -> ".json";
            };

            String filename = "rapport_" + rapport.getId() + "_" +
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + extension;
            Path output = Paths.get(storageConfig.getPath(), filename);
            Files.write(output, fileContent);

            rapport.setCheminFichier(output.toAbsolutePath().toString());
            rapport.setStatus(Rapport.ReportStatus.TERMINE);
            return rapportRepository.save(rapport);
        } catch (Exception ex) {
            rapport.setStatus(Rapport.ReportStatus.ERREUR);
            rapportRepository.save(rapport);
            throw new IllegalStateException("Generation du rapport echouee", ex);
        }
    }

    public Rapport generateOccupationSalleReport(LocalDate from, LocalDate to, Long salleId, Long userId, Rapport.ReportFormat format) {
        RapportRequest request = new RapportRequest(Rapport.ReportType.OCCUPATION_SALLE, format, from, to, salleId, null, null, Map.of());
        return generate(request, userId);
    }

    public Rapport generateChargeEnseignantReport(LocalDate from, LocalDate to, Long teacherId, Long userId, Rapport.ReportFormat format) {
        RapportRequest request = new RapportRequest(Rapport.ReportType.CHARGE_ENSEIGNANT, format, from, to, null, teacherId, null, Map.of());
        return generate(request, userId);
    }

    public Rapport generateStatistiquesEcoleReport(Long schoolId, Long userId, Rapport.ReportFormat format) {
        RapportRequest request = new RapportRequest(Rapport.ReportType.STATISTIQUES_ECOLE, format, LocalDate.now().minusDays(30), LocalDate.now(), null, null, schoolId, Map.of());
        return generate(request, userId);
    }

    public Rapport generateEvenementsReport(LocalDate from, LocalDate to, Long userId, Rapport.ReportFormat format) {
        RapportRequest request = new RapportRequest(Rapport.ReportType.EVENEMENTS, format, from, to, null, null, null, Map.of());
        return generate(request, userId);
    }

    public Rapport generateGlobalReport(LocalDate from, LocalDate to, Long userId, Rapport.ReportFormat format) {
        RapportRequest request = new RapportRequest(Rapport.ReportType.GLOBAL, format, from, to, null, null, null, Map.of());
        return generate(request, userId);
    }

    /**
     * Retourne des statistiques agrégées pour le dashboard (sans générer de fichier).
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats(LocalDate from, LocalDate to) {
        List<Map<String, Object>> roomOccupation = dataAggregationService.aggregateRoomOccupation(from, to, null);
        List<Map<String, Object>> teacherLoad = dataAggregationService.aggregateTeacherLoad(from, to, null);
        List<Map<String, Object>> global = dataAggregationService.aggregateGlobal(from, to);

        Map<String, Object> globalRow = global.isEmpty() ? Map.of() : global.get(0);

        // Occupation par jour de la semaine (lundi-vendredi)
        List<Map<String, Object>> scheduleEntries = dataAggregationService.aggregateGlobal(from, to);

        Map<String, Object> stats = new java.util.LinkedHashMap<>();
        stats.put("totalRooms", globalRow.getOrDefault("rooms", 0));
        stats.put("totalTeachers", globalRow.getOrDefault("teachers", 0));
        stats.put("totalScheduleEntries", globalRow.getOrDefault("scheduleEntries", 0));
        stats.put("totalEvents", globalRow.getOrDefault("events", 0));
        stats.put("roomOccupation", roomOccupation);
        stats.put("teacherLoad", teacherLoad);
        stats.put("periodeDebut", from);
        stats.put("periodeFin", to);
        return stats;
    }

    @Transactional(readOnly = true)
    public byte[] loadReportFile(Long id) {
        Rapport rapport = getById(id);
        if (rapport.getCheminFichier() == null) {
            throw new EntityNotFoundException("Fichier de rapport introuvable");
        }
        try {
            return Files.readAllBytes(Paths.get(rapport.getCheminFichier()));
        } catch (IOException ex) {
            throw new IllegalStateException("Impossible de lire le fichier du rapport", ex);
        }
    }

    public void delete(Long id) {
        Rapport rapport = getById(id);
        if (rapport.getCheminFichier() != null) {
            try {
                Files.deleteIfExists(Paths.get(rapport.getCheminFichier()));
            } catch (IOException ignored) {
            }
        }
        rapportRepository.deleteById(id);
    }

    public int purgeExpiredReports() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(storageConfig.getRetentionDays());
        List<Rapport> expired = rapportRepository.findByDateGenerationBetween(LocalDateTime.MIN, threshold);
        for (Rapport report : expired) {
            if (report.getCheminFichier() != null) {
                try {
                    Files.deleteIfExists(Paths.get(report.getCheminFichier()));
                } catch (IOException ignored) {
                }
            }
            rapportRepository.delete(report);
        }
        return expired.size();
    }

    private RapportData generateData(RapportRequest request, Long userId, LocalDate from, LocalDate to) {
        List<Map<String, Object>> rows = switch (request.getType()) {
            case OCCUPATION_SALLE -> dataAggregationService.aggregateRoomOccupation(from, to, request.getSalleId());
            case CHARGE_ENSEIGNANT -> dataAggregationService.aggregateTeacherLoad(from, to, request.getTeacherId());
            case STATISTIQUES_ECOLE -> dataAggregationService.aggregateSchoolStats(request.getSchoolId());
            case EVENEMENTS -> dataAggregationService.aggregateEvents(from, to);
            case GLOBAL -> dataAggregationService.aggregateGlobal(from, to);
        };

        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("periodeDebut", from);
        metadata.put("periodeFin", to);
        metadata.put("rows", rows.size());
        metadata.put("generatedBy", userId);

        return RapportData.builder()
            .titre(buildTitle(request.getType(), from, to))
            .type(request.getType())
            .generatedAt(LocalDateTime.now())
            .periodeDebut(from)
            .periodeFin(to)
            .generatedBy(userId)
            .metadata(metadata)
            .rows(rows)
            .build();
    }

    private String buildTitle(Rapport.ReportType type, LocalDate from, LocalDate to) {
        return switch (type) {
            case OCCUPATION_SALLE -> "Rapport Occupation Salles";
            case CHARGE_ENSEIGNANT -> "Rapport Charge Enseignants";
            case STATISTIQUES_ECOLE -> "Rapport Statistiques Ecole";
            case EVENEMENTS -> "Rapport Evenements";
            case GLOBAL -> "Rapport Global";
        } + " (" + from + " au " + to + ")";
    }
}
