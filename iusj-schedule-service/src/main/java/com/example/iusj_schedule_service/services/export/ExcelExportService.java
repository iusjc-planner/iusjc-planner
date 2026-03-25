package com.example.iusj_schedule_service.services.export;

import com.example.iusj_schedule_service.dto.EDTExportData;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ExcelExportService {

    private static final List<DayOfWeek> DAYS = List.of(
        DayOfWeek.MONDAY,
        DayOfWeek.TUESDAY,
        DayOfWeek.WEDNESDAY,
        DayOfWeek.THURSDAY,
        DayOfWeek.FRIDAY,
        DayOfWeek.SATURDAY
    );

    public byte[] exportWeeklyEdtExcel(EDTExportData exportData) {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("EDT");
            buildSheet(workbook, sheet, exportData);
            workbook.write(output);
            return output.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("Erreur lors de la generation Excel", e);
        }
    }

    private void buildSheet(XSSFWorkbook workbook, Sheet sheet, EDTExportData exportData) {
        CellStyle titleStyle = titleStyle(workbook);
        CellStyle headerStyle = headerStyle(workbook);
        CellStyle timeStyle = timeStyle(workbook);
        CellStyle defaultStyle = defaultContentStyle(workbook);

        int rowIndex = 0;

        Row titleRow = sheet.createRow(rowIndex++);
        createCell(titleRow, 0, "Emploi du temps", titleStyle);

        Row infoRow = sheet.createRow(rowIndex++);
        String info = String.format(
            Locale.ROOT,
            "Semaine %d / %d - %s %d",
            exportData.getSemaine(),
            exportData.getAnnee(),
            exportData.getVue(),
            exportData.getTargetId()
        );
        createCell(infoRow, 0, info, defaultStyle);

        Row generatedRow = sheet.createRow(rowIndex++);
        String generatedAt = exportData.getGeneratedAt() == null
            ? "n/a"
            : exportData.getGeneratedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        createCell(generatedRow, 0, "Genere le " + generatedAt, defaultStyle);

        rowIndex++;

        Row headerRow = sheet.createRow(rowIndex++);
        createCell(headerRow, 0, "Horaire", headerStyle);
        for (int i = 0; i < DAYS.size(); i++) {
            createCell(headerRow, i + 1, capitalize(DAYS.get(i).name().toLowerCase(Locale.ROOT)), headerStyle);
        }

        Map<DayOfWeek, List<EDTExportData.ExportEntry>> byDay = exportData.getEntries().stream()
            .filter(e -> e.getStartTime() != null && e.getEndTime() != null)
            .collect(Collectors.groupingBy(e -> e.getStartTime().getDayOfWeek()));

        for (int hour = 8; hour <= 16; hour++) {
            Row row = sheet.createRow(rowIndex++);
            createCell(row, 0, String.format(Locale.ROOT, "%02d:00-%02d:00", hour, hour + 1), timeStyle);
            for (int i = 0; i < DAYS.size(); i++) {
                DayOfWeek day = DAYS.get(i);
                String content = contentForSlot(byDay.get(day), hour);
                CellStyle cellStyle = styleForSlot(workbook, content);
                createCell(row, i + 1, content, cellStyle == null ? defaultStyle : cellStyle);
            }
        }

        Row legendRow = sheet.createRow(rowIndex + 1);
        createCell(legendRow, 0, "Legende:", defaultStyle);
        createCell(legendRow, 1, "CM", cmStyle(workbook));
        createCell(legendRow, 2, "TD", tdStyle(workbook));
        createCell(legendRow, 3, "TP", tpStyle(workbook));
        createCell(legendRow, 4, "EXAM", examStyle(workbook));

        for (int col = 0; col <= DAYS.size(); col++) {
            sheet.autoSizeColumn(col);
            int width = sheet.getColumnWidth(col);
            sheet.setColumnWidth(col, Math.min(width + 1024, 12000));
        }
    }

    private String contentForSlot(List<EDTExportData.ExportEntry> entries, int hour) {
        if (entries == null || entries.isEmpty()) {
            return "";
        }
        return entries.stream()
            .filter(entry -> isInHour(entry.getStartTime(), entry.getEndTime(), hour))
            .sorted(Comparator.comparing(EDTExportData.ExportEntry::getStartTime))
            .map(this::formatEntry)
            .collect(Collectors.joining("\n"));
    }

    private boolean isInHour(LocalDateTime start, LocalDateTime end, int hour) {
        return start.getHour() <= hour && end.getHour() > hour;
    }

    private String formatEntry(EDTExportData.ExportEntry entry) {
        String kind = classifyCourseType(entry.getCourseId());
        return String.format(
            Locale.ROOT,
            "%s %02dh-%02dh\nCours#%d Ens#%d Salle#%d",
            kind,
            entry.getStartTime().getHour(),
            entry.getEndTime().getHour(),
            entry.getCourseId(),
            entry.getTeacherId(),
            entry.getRoomId()
        );
    }

    private CellStyle styleForSlot(XSSFWorkbook workbook, String content) {
        if (content == null || content.isBlank()) {
            return null;
        }
        if (content.startsWith("CM")) {
            return cmStyle(workbook);
        }
        if (content.startsWith("TD")) {
            return tdStyle(workbook);
        }
        if (content.startsWith("TP")) {
            return tpStyle(workbook);
        }
        if (content.startsWith("EXAM")) {
            return examStyle(workbook);
        }
        return defaultContentStyle(workbook);
    }

    private String classifyCourseType(Long courseId) {
        if (courseId == null) {
            return "CM";
        }
        int idx = (int) (Math.abs(courseId) % 4);
        return switch (idx) {
            case 0 -> "CM";
            case 1 -> "TD";
            case 2 -> "TP";
            default -> "EXAM";
        };
    }

    private String capitalize(String value) {
        if (value.isEmpty()) {
            return value;
        }
        return Character.toUpperCase(value.charAt(0)) + value.substring(1);
    }

    private void createCell(Row row, int index, String value, CellStyle style) {
        Cell cell = row.createCell(index);
        cell.setCellValue(value == null ? "" : value);
        if (style != null) {
            cell.setCellStyle(style);
        }
    }

    private CellStyle titleStyle(XSSFWorkbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 16);
        style.setFont(font);
        return style;
    }

    private CellStyle headerStyle(XSSFWorkbook workbook) {
        CellStyle style = baseCellStyle(workbook);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        return style;
    }

    private CellStyle timeStyle(XSSFWorkbook workbook) {
        CellStyle style = baseCellStyle(workbook);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }

    private CellStyle defaultContentStyle(XSSFWorkbook workbook) {
        CellStyle style = baseCellStyle(workbook);
        style.setWrapText(true);
        return style;
    }

    private CellStyle cmStyle(XSSFWorkbook workbook) {
        CellStyle style = defaultContentStyle(workbook);
        style.setFillForegroundColor(IndexedColors.PALE_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }

    private CellStyle tdStyle(XSSFWorkbook workbook) {
        CellStyle style = defaultContentStyle(workbook);
        style.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }

    private CellStyle tpStyle(XSSFWorkbook workbook) {
        CellStyle style = defaultContentStyle(workbook);
        style.setFillForegroundColor(IndexedColors.LIGHT_ORANGE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }

    private CellStyle examStyle(XSSFWorkbook workbook) {
        CellStyle style = defaultContentStyle(workbook);
        style.setFillForegroundColor(IndexedColors.ROSE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }

    private CellStyle baseCellStyle(XSSFWorkbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }
}
