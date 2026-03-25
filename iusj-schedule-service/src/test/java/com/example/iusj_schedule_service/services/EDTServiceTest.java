package com.example.iusj_schedule_service.services;

import com.example.iusj_schedule_service.dto.ValidationReport;
import com.example.iusj_schedule_service.entities.EDT;
import com.example.iusj_schedule_service.repositories.EDTRepository;
import com.example.iusj_schedule_service.repositories.ScheduleEntryRepository;
import com.example.iusj_schedule_service.services.export.ExcelExportService;
import com.example.iusj_schedule_service.services.export.PdfExportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EDTServiceTest {

    @Mock
    private EDTRepository edtRepository;

    @Mock
    private ScheduleEntryRepository scheduleEntryRepository;

    @Mock
    private ScheduleService scheduleService;

    @Mock
    private EDTValidationService edtValidationService;

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private PdfExportService pdfExportService;

    @Mock
    private ExcelExportService excelExportService;

    @InjectMocks
    private EDTService edtService;

    private EDT edt;

    @BeforeEach
    void setUp() {
        edt = new EDT();
        edt.setId(1L);
        edt.setSemaine(12);
        edt.setAnnee(2026);
        edt.setVue(EDT.VueType.GROUPE);
        edt.setTargetId(10L);
        edt.setStatus(EDT.EDTStatus.DRAFT);
    }

    @Test
    void validate_ShouldSetStatusValidated_WhenReportValid() {
        ValidationReport report = new ValidationReport();
        report.setEdtId(1L);
        report.setStatus(ValidationReport.ValidationStatus.VALID);
        report.setErrors(List.of());

        when(edtRepository.findById(1L)).thenReturn(Optional.of(edt));
        when(edtValidationService.generateReport(edt)).thenReturn(report);
        when(edtRepository.save(any(EDT.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ValidationReport result = edtService.validate(1L);

        assertEquals(ValidationReport.ValidationStatus.VALID, result.getStatus());
        assertEquals(EDT.EDTStatus.VALIDATED, edt.getStatus());
    }

    @Test
    void publish_ShouldRequireValidatedStatus() {
        when(edtRepository.findById(1L)).thenReturn(Optional.of(edt));

        assertThrows(IllegalStateException.class, () -> edtService.publish(1L));
    }

    @Test
    void unpublish_ShouldReturnToValidated_WhenPublished() {
        edt.setStatus(EDT.EDTStatus.PUBLISHED);
        edt.setDatePublication(LocalDateTime.now());

        when(edtRepository.findById(1L)).thenReturn(Optional.of(edt));
        when(edtRepository.save(any(EDT.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EDT result = edtService.unpublish(1L);

        assertEquals(EDT.EDTStatus.VALIDATED, result.getStatus());
    }
}
