package com.example.iusj_report_service.services;

import com.example.iusj_report_service.config.StorageConfig;
import com.example.iusj_report_service.entities.Rapport;
import com.example.iusj_report_service.repositories.RapportRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for RapportService.
 * Tests core CRUD and listing functionality with mocked dependencies.
 */
@ExtendWith(MockitoExtension.class)
class RapportServiceTest {

    @Mock
    private RapportRepository rapportRepository;

    @Mock
    private DataAggregationService dataAggregationService;

    @Mock
    private ExportService exportService;

    @Mock
    private StorageConfig storageConfig;

    @InjectMocks
    private RapportService rapportService;

    private Rapport testRapport;

    @BeforeEach
    void setUp() {
        testRapport = new Rapport();
        testRapport.setId(1L);
        testRapport.setTitre("Test Report");
        testRapport.setType(Rapport.ReportType.OCCUPATION_SALLE);
        testRapport.setFormat(Rapport.ReportFormat.PDF);
        testRapport.setGenerePar(1L);
        testRapport.setStatus(Rapport.ReportStatus.TERMINE);
        testRapport.setDateGeneration(LocalDateTime.now());
    }

    // ===== Listing Tests =====

    @Test
    void testListReportsWithoutFilters() {
        List<Rapport> reports = List.of(testRapport);
        when(rapportRepository.findAll(any(Sort.class))).thenReturn(reports);

        List<Rapport> result = rapportService.listReports(null, null);

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(rapportRepository).findAll(any(Sort.class));
    }

    @Test
    void testListReportsByType() {
        List<Rapport> reports = List.of(testRapport);
        when(rapportRepository.findByType(Rapport.ReportType.OCCUPATION_SALLE))
                .thenReturn(reports);

        List<Rapport> result = rapportService.listReports(Rapport.ReportType.OCCUPATION_SALLE, null);

        assertEquals(1, result.size());
        verify(rapportRepository).findByType(Rapport.ReportType.OCCUPATION_SALLE);
    }

    @Test
    void testListReportsByUser() {
        List<Rapport> reports = List.of(testRapport);
        when(rapportRepository.findByGenerePar(1L)).thenReturn(reports);

        List<Rapport> result = rapportService.listReports(null, 1L);

        assertEquals(1, result.size());
        verify(rapportRepository).findByGenerePar(1L);
    }

    // ===== Retrieval Tests =====

    @Test
    void testGetByIdSuccess() {
        when(rapportRepository.findById(1L)).thenReturn(Optional.of(testRapport));

        Rapport result = rapportService.getById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Test Report", result.getTitre());
    }

    @Test
    void testGetByIdNotFound() {
        when(rapportRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> rapportService.getById(999L));
    }

    // ===== Deletion Tests =====

    @Test
    void testDeleteSuccess() {
        when(rapportRepository.findById(1L)).thenReturn(Optional.of(testRapport));

        rapportService.delete(1L);

        verify(rapportRepository).deleteById(1L);
    }

    @Test
    void testDeleteNotFound() {
        when(rapportRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> rapportService.delete(999L));
    }

    // ===== Entity State Tests =====

    @Test
    void testRapportTypeEnumHandling() {
        Rapport occupationReport = new Rapport();
        occupationReport.setType(Rapport.ReportType.OCCUPATION_SALLE);
        assertEquals(Rapport.ReportType.OCCUPATION_SALLE, occupationReport.getType());

        Rapport chargeReport = new Rapport();
        chargeReport.setType(Rapport.ReportType.CHARGE_ENSEIGNANT);
        assertEquals(Rapport.ReportType.CHARGE_ENSEIGNANT, chargeReport.getType());

        Rapport statsReport = new Rapport();
        statsReport.setType(Rapport.ReportType.STATISTIQUES_ECOLE);
        assertEquals(Rapport.ReportType.STATISTIQUES_ECOLE, statsReport.getType());
    }

    @Test
    void testRapportStatusEnumHandling() {
        Rapport rapport = new Rapport();
        
        rapport.setStatus(Rapport.ReportStatus.EN_COURS);
        assertEquals(Rapport.ReportStatus.EN_COURS, rapport.getStatus());

        rapport.setStatus(Rapport.ReportStatus.TERMINE);
        assertEquals(Rapport.ReportStatus.TERMINE, rapport.getStatus());

        rapport.setStatus(Rapport.ReportStatus.ERREUR);
        assertEquals(Rapport.ReportStatus.ERREUR, rapport.getStatus());
    }

    @Test
    void testRapportFormatEnumHandling() {
        Rapport pdfReport = new Rapport();
        pdfReport.setFormat(Rapport.ReportFormat.PDF);
        assertEquals(Rapport.ReportFormat.PDF, pdfReport.getFormat());

        Rapport excelReport = new Rapport();
        excelReport.setFormat(Rapport.ReportFormat.EXCEL);
        assertEquals(Rapport.ReportFormat.EXCEL, excelReport.getFormat());

        Rapport jsonReport = new Rapport();
        jsonReport.setFormat(Rapport.ReportFormat.JSON);
        assertEquals(Rapport.ReportFormat.JSON, jsonReport.getFormat());
    }

    @Test
    void testRapportPropertiesHandling() {
        Rapport rapport = new Rapport();
        
        rapport.setId(123L);
        assertEquals(123L, rapport.getId());
        
        rapport.setTitre("My Report");
        assertEquals("My Report", rapport.getTitre());
        
        rapport.setGenerePar(456L);
        assertEquals(456L, rapport.getGenerePar());
        
        LocalDate now = LocalDate.now();
        rapport.setPeriodeDebut(now.minusDays(30));
        assertEquals(now.minusDays(30), rapport.getPeriodeDebut());
        
        rapport.setPeriodeFin(now);
        assertEquals(now, rapport.getPeriodeFin());
    }

    // ===== Generation Tests =====

    @Test
    void testGenerateSuccess() throws Exception {
        com.example.iusj_report_service.dto.RapportRequest request = new com.example.iusj_report_service.dto.RapportRequest(
                Rapport.ReportType.OCCUPATION_SALLE, Rapport.ReportFormat.PDF,
                LocalDate.now().minusDays(10), LocalDate.now(), 1L, null, null, Map.of()
        );

        when(rapportRepository.save(any(Rapport.class))).thenAnswer(invocation -> {
            Rapport saved = invocation.getArgument(0);
            saved.setId(10L);
            return saved;
        });

        when(storageConfig.getPath()).thenReturn(System.getProperty("java.io.tmpdir"));
        when(exportService.exportToPdf(any(), anyString())).thenReturn(new byte[]{1, 2, 3});

        Rapport result = rapportService.generate(request, 100L);

        assertNotNull(result);
        assertEquals(Rapport.ReportStatus.TERMINE, result.getStatus());
        assertNotNull(result.getCheminFichier());
        verify(exportService).exportToPdf(any(), anyString());
    }

    @Test
    void testGenerateException() throws Exception {
        com.example.iusj_report_service.dto.RapportRequest request = new com.example.iusj_report_service.dto.RapportRequest(
                Rapport.ReportType.CHARGE_ENSEIGNANT, Rapport.ReportFormat.EXCEL,
                null, null, null, 2L, null, Map.of()
        );

        when(rapportRepository.save(any(Rapport.class))).thenAnswer(invocation -> {
            Rapport saved = invocation.getArgument(0);
            saved.setId(11L);
            return saved;
        });

        when(exportService.exportToExcel(any())).thenThrow(new RuntimeException("Export failed"));

        assertThrows(IllegalStateException.class, () -> rapportService.generate(request, 100L));
    }

    // ===== Load File Tests =====

    @Test
    void testLoadReportFileSuccess() throws Exception {
        Path tempFile = java.nio.file.Files.createTempFile("test_report", ".pdf");
        java.nio.file.Files.write(tempFile, new byte[]{4, 5, 6});

        testRapport.setCheminFichier(tempFile.toAbsolutePath().toString());
        when(rapportRepository.findById(1L)).thenReturn(Optional.of(testRapport));

        byte[] content = rapportService.loadReportFile(1L);

        assertNotNull(content);
        assertEquals(3, content.length);

        java.nio.file.Files.deleteIfExists(tempFile);
    }

    @Test
    void testLoadReportFileNotFound() {
        testRapport.setCheminFichier(null);
        when(rapportRepository.findById(1L)).thenReturn(Optional.of(testRapport));

        assertThrows(EntityNotFoundException.class, () -> rapportService.loadReportFile(1L));
    }

    // ===== Purge Tests =====

    @Test
    void testPurgeExpiredReports() {
        when(storageConfig.getRetentionDays()).thenReturn(30);
        Rapport expiredReport = new Rapport();
        expiredReport.setId(20L);
        when(rapportRepository.findByDateGenerationBetween(any(), any())).thenReturn(List.of(expiredReport));

        int count = rapportService.purgeExpiredReports();

        assertEquals(1, count);
        verify(rapportRepository).delete(expiredReport);
    }
}
