package com.example.iusj_schedule_service.services.export;

import com.example.iusj_schedule_service.dto.EDTExportData;
import com.example.iusj_schedule_service.entities.EDT;
import com.lowagie.text.pdf.PdfReader;
import com.lowagie.text.pdf.parser.PdfTextExtractor;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;

class PdfExportServiceTest {

    private final PdfExportService service = new PdfExportService();

    @Test
    void exportWeeklyEdtPdf_shouldContainHeaderAndCourseContent() throws Exception {
        EDT edt = new EDT();
        edt.setAnnee(2026);
        edt.setSemaine(12);
        edt.setVue(EDT.VueType.GROUPE);
        edt.setTargetId(5L);

        EDTExportData exportData = EDTExportData.builder()
                .semaine(12)
                .annee(2026)
                .vue("GROUPE")
                .targetId(5L)
                .entries(List.of(
                        EDTExportData.ExportEntry.builder()
                                .courseId(21L)
                                .courseLabel("Compilation")
                                .courseType("TD")
                                .teacherLabel("Fr Georges")
                                .roomLabel("Salle B202")
                                .groupId(5L)
                                .startTime(LocalDateTime.of(2026, 3, 24, 10, 0))
                                .endTime(LocalDateTime.of(2026, 3, 24, 12, 0))
                                .build()
                ))
                .build();

        byte[] bytes = service.exportWeeklyEdtPdf(edt, exportData);
        assertTrue(bytes.length > 0);

        PdfReader reader = new PdfReader(new ByteArrayInputStream(bytes));
        PdfTextExtractor extractor = new PdfTextExtractor(reader);
        String pageText = extractor.getTextFromPage(1);
        reader.close();

        assertTrue(pageText.contains("Emploi de temps 2026"));
        assertTrue(pageText.contains("HORAIRES"));
        assertTrue(pageText.contains("Compilation"));
    }
}
