package com.example.iusj_schedule_service.services.export;

import com.example.iusj_schedule_service.dto.EDTExportData;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ExcelExportServiceTest {

    private final ExcelExportService service = new ExcelExportService();

    @Test
    void exportWeeklyEdtExcel_shouldContainGridPauseAndCourseLabel() throws Exception {
        EDTExportData exportData = EDTExportData.builder()
                .semaine(12)
                .annee(2026)
                .vue("GROUPE")
                .targetId(5L)
                .entries(List.of(
                        EDTExportData.ExportEntry.builder()
                                .courseId(11L)
                                .courseLabel("Machine Learning")
                                .courseType("CM")
                                .teacherLabel("Jean Dupont")
                                .roomLabel("Salle A1")
                                .groupId(5L)
                                .startTime(LocalDateTime.of(2026, 3, 23, 8, 0))
                                .endTime(LocalDateTime.of(2026, 3, 23, 10, 0))
                                .build()
                ))
                .build();

        byte[] bytes = service.exportWeeklyEdtExcel(exportData);
        assertTrue(bytes.length > 0);

        try (XSSFWorkbook workbook = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            Sheet sheet = workbook.getSheet("EDT");
            assertEquals("Machine Learning\nJean Dupont\nSalle A1", sheet.getRow(5).getCell(1).getStringCellValue());
            assertEquals("PAUSE", sheet.getRow(9).getCell(1).getStringCellValue());
            assertTrue(sheet.getMergedRegions().stream().anyMatch(r ->
                    r.getFirstRow() == 5 && r.getLastRow() == 6 && r.getFirstColumn() == 1 && r.getLastColumn() == 1
            ));
        }
    }
}
