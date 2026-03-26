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
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.DayOfWeek;
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
        CellStyle pauseStyle = pauseStyle(workbook);

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

        int headerRowIndex = rowIndex++;
        Row headerRow = sheet.createRow(headerRowIndex);
        createCell(headerRow, 0, "HORAIRES", headerStyle);
        for (int i = 0; i < DAYS.size(); i++) {
            createCell(headerRow, i + 1, capitalize(DAYS.get(i).name().toLowerCase(Locale.ROOT)), headerStyle);
        }

        int firstHour = 8;
        int lastHour = 16;
        for (int hour = firstHour; hour <= lastHour; hour++) {
            Row row = sheet.createRow(rowIndex + (hour - firstHour));
            createCell(row, 0, String.format(Locale.ROOT, "%02d:00 - %02d:00", hour, hour + 1), timeStyle);
            for (int i = 0; i < DAYS.size(); i++) {
                if (hour == 12) {
                    createCell(row, i + 1, "PAUSE", pauseStyle);
                } else {
                    createCell(row, i + 1, "", defaultStyle);
                }
            }
        }

        Map<DayOfWeek, List<EDTExportData.ExportEntry>> byDay = (exportData.getEntries() == null ? List.<EDTExportData.ExportEntry>of() : exportData.getEntries())
                .stream()
                .filter(e -> e.getStartTime() != null && e.getEndTime() != null)
                .collect(Collectors.groupingBy(e -> e.getStartTime().getDayOfWeek()));

        for (int dayIndex = 0; dayIndex < DAYS.size(); dayIndex++) {
            DayOfWeek day = DAYS.get(dayIndex);
            int column = dayIndex + 1;
            List<EDTExportData.ExportEntry> entries = byDay.getOrDefault(day, List.of()).stream()
                    .sorted(Comparator.comparing(EDTExportData.ExportEntry::getStartTime))
                    .toList();
            for (EDTExportData.ExportEntry entry : entries) {
                int startHour = Math.max(firstHour, entry.getStartTime().getHour());
                int endHourExclusive = Math.min(lastHour + 1, entry.getEndTime().getHour());
                if (endHourExclusive <= startHour) {
                    continue;
                }

                int startRow = rowIndex + (startHour - firstHour);
                int endRow = rowIndex + (endHourExclusive - firstHour) - 1;
                String text = formatEntry(entry);
                CellStyle style = styleForType(workbook, entry.getCourseType());

                Row topRow = ensureRow(sheet, startRow);
                createCell(topRow, column, text, style);
                for (int r = startRow + 1; r <= endRow; r++) {
                    Row continuation = ensureRow(sheet, r);
                    createCell(continuation, column, "", style);
                }

                if (endRow > startRow) {
                    addMergedRegionSafely(sheet, startRow, endRow, column);
                }
            }
        }

        int legendRowIndex = rowIndex + (lastHour - firstHour) + 2;
        Row legendRow = sheet.createRow(legendRowIndex);
        createCell(legendRow, 0, "Legende:", defaultStyle);
        createCell(legendRow, 1, "CM", styleForType(workbook, "CM"));
        createCell(legendRow, 2, "TD", styleForType(workbook, "TD"));
        createCell(legendRow, 3, "TP", styleForType(workbook, "TP"));
        createCell(legendRow, 4, "EXAM", styleForType(workbook, "EXAM"));

        for (int col = 0; col <= DAYS.size(); col++) {
            sheet.autoSizeColumn(col);
            int width = sheet.getColumnWidth(col);
            sheet.setColumnWidth(col, Math.min(width + 900, 14000));
        }
    }

    private Row ensureRow(Sheet sheet, int rowIndex) {
        Row row = sheet.getRow(rowIndex);
        return row == null ? sheet.createRow(rowIndex) : row;
    }

    private void addMergedRegionSafely(Sheet sheet, int firstRow, int lastRow, int column) {
        CellRangeAddress candidate = new CellRangeAddress(firstRow, lastRow, column, column);
        for (CellRangeAddress existing : sheet.getMergedRegions()) {
            if (existing.intersects(candidate)) {
                return;
            }
        }
        sheet.addMergedRegion(candidate);
    }

    private String formatEntry(EDTExportData.ExportEntry entry) {
        String course = entry.getCourseLabel() == null || entry.getCourseLabel().isBlank()
                ? "Cours #" + entry.getCourseId()
                : entry.getCourseLabel();
        String teacher = entry.getTeacherLabel() == null ? "" : entry.getTeacherLabel();
        String room = entry.getRoomLabel() == null ? "" : entry.getRoomLabel();
        return String.format(
                Locale.ROOT,
                "%s\n%s\n%s",
                course,
                teacher,
                room
        ).trim();
    }

    private CellStyle styleForType(XSSFWorkbook workbook, String courseType) {
        CellStyle style = defaultContentStyle(workbook);
        String normalized = courseType == null ? "" : courseType.toUpperCase(Locale.ROOT);
        short fill = switch (normalized) {
            case "CM" -> IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex();
            case "TD" -> IndexedColors.LIGHT_GREEN.getIndex();
            case "TP" -> IndexedColors.LIGHT_ORANGE.getIndex();
            case "EXAM" -> IndexedColors.ROSE.getIndex();
            default -> IndexedColors.WHITE.getIndex();
        };
        style.setFillForegroundColor(fill);
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }

    private String capitalize(String value) {
        if (value.isEmpty()) {
            return value;
        }
        return Character.toUpperCase(value.charAt(0)) + value.substring(1);
    }

    private void createCell(Row row, int index, String value, CellStyle style) {
        Cell cell = row.getCell(index);
        if (cell == null) {
            cell = row.createCell(index);
        }
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
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        return style;
    }

    private CellStyle pauseStyle(XSSFWorkbook workbook) {
        CellStyle style = baseCellStyle(workbook);
        style.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        return style;
    }

    private CellStyle defaultContentStyle(XSSFWorkbook workbook) {
        CellStyle style = baseCellStyle(workbook);
        style.setWrapText(true);
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
