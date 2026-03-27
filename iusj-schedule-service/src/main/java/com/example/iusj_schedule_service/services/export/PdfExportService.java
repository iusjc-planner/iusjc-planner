package com.example.iusj_schedule_service.services.export;

import com.example.iusj_schedule_service.dto.EDTExportData;
import com.example.iusj_schedule_service.entities.EDT;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class PdfExportService {

    private static final List<DayOfWeek> DAYS = List.of(
            DayOfWeek.MONDAY,
            DayOfWeek.TUESDAY,
            DayOfWeek.WEDNESDAY,
            DayOfWeek.THURSDAY,
            DayOfWeek.FRIDAY,
            DayOfWeek.SATURDAY
    );

    public byte[] exportWeeklyEdtPdf(EDT edt, EDTExportData exportData) {
        try {
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4.rotate(), 20f, 20f, 20f, 20f);
            PdfWriter.getInstance(document, output);
            document.open();

            addHeader(document, edt);
            addGrid(document, exportData);
            addLegend(document);

            document.close();
            return output.toByteArray();
        } catch (DocumentException e) {
            throw new IllegalStateException("Erreur lors de la generation PDF", e);
        }
    }

    private void addHeader(Document document, EDT edt) throws DocumentException {
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, Color.BLACK);
        Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 11, Color.DARK_GRAY);

        Paragraph org = new Paragraph("INSTITUT UNIVERSITAIRE SAINT JEAN", titleFont);
        org.setAlignment(Element.ALIGN_CENTER);
        document.add(org);

        Paragraph school = new Paragraph("SAINT JEAN INGENIEUR", subtitleFont);
        school.setAlignment(Element.ALIGN_CENTER);
        document.add(school);
        document.add(new Paragraph(" "));

        LocalDate monday = mondayOfWeek(edt.getAnnee(), edt.getSemaine());
        LocalDate saturday = monday.plusDays(5);
        String header = String.format(
                "Emploi de temps %d - %s %d (Semaine du %s au %s)",
                edt.getAnnee(),
                vueLabel(edt.getVue()),
                edt.getTargetId(),
                formatDate(monday),
                formatDate(saturday)
        );
        Paragraph context = new Paragraph(header, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.BLACK));
        context.setAlignment(Element.ALIGN_CENTER);
        document.add(context);
        document.add(new Paragraph(" "));
    }

    private void addGrid(Document document, EDTExportData exportData) throws DocumentException {
        PdfPTable table = new PdfPTable(7);
        table.setWidthPercentage(100f);
        table.setWidths(new float[]{1.4f, 2f, 2f, 2f, 2f, 2f, 2f});

        addHeaderCell(table, "HORAIRES");
        addHeaderCell(table, "Lundi");
        addHeaderCell(table, "Mardi");
        addHeaderCell(table, "Mercredi");
        addHeaderCell(table, "Jeudi");
        addHeaderCell(table, "Vendredi");
        addHeaderCell(table, "Samedi");

        List<EDTExportData.ExportEntry> entries = exportData.getEntries() == null ? List.of() : exportData.getEntries();
        entries = entries.stream()
                .filter(e -> e.getStartTime() != null && e.getEndTime() != null)
                .sorted(Comparator.comparing(EDTExportData.ExportEntry::getStartTime))
                .toList();

        for (int hour = 8; hour <= 16; hour++) {
            addTimeCell(table, String.format("%02d:00 - %02d:00", hour, hour + 1));

            for (DayOfWeek day : DAYS) {
                if (hour == 12) {
                    addBodyCell(table, "PAUSE", new Color(146, 208, 80), true, false);
                    continue;
                }

                EDTExportData.ExportEntry matched = findEntry(entries, day, hour);
                if (matched == null) {
                    addBodyCell(table, "", Color.WHITE, false, false);
                    continue;
                }

                boolean firstHour = matched.getStartTime().getHour() == hour;
                String content = firstHour ? formatEntry(matched) : "";
                addBodyCell(table, content, colorForType(matched.getCourseType()), false, !firstHour);
            }
        }

        document.add(table);
    }

    private void addLegend(Document document) throws DocumentException {
        document.add(new Paragraph(" "));
        PdfPTable legend = new PdfPTable(5);
        legend.setWidthPercentage(65f);
        legend.setWidths(new float[]{2f, 1f, 1f, 1f, 1f});
        addLegendCell(legend, "Legende");
        addBodyCell(legend, "CM", colorForType("CM"), true, false);
        addBodyCell(legend, "TD", colorForType("TD"), true, false);
        addBodyCell(legend, "TP", colorForType("TP"), true, false);
        addBodyCell(legend, "EXAM", colorForType("EXAM"), true, false);
        document.add(legend);
    }

    private EDTExportData.ExportEntry findEntry(List<EDTExportData.ExportEntry> entries, DayOfWeek day, int hour) {
        for (EDTExportData.ExportEntry entry : entries) {
            if (entry.getStartTime().getDayOfWeek() != day) {
                continue;
            }
            if (entry.getStartTime().getHour() <= hour && entry.getEndTime().getHour() > hour) {
                return entry;
            }
        }
        return null;
    }

    private String formatEntry(EDTExportData.ExportEntry entry) {
        List<String> lines = new ArrayList<>();
        lines.add(entry.getCourseLabel() == null ? "Cours #" + entry.getCourseId() : entry.getCourseLabel());
        if (entry.getTeacherLabel() != null && !entry.getTeacherLabel().isBlank()) {
            lines.add(entry.getTeacherLabel());
        }
        if (entry.getRoomLabel() != null && !entry.getRoomLabel().isBlank()) {
            lines.add(entry.getRoomLabel());
        }
        return String.join("\n", lines);
    }

    private void addHeaderCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK)));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(6f);
        cell.setBackgroundColor(new Color(230, 230, 230));
        table.addCell(cell);
    }

    private void addTimeCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.BLACK)));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(4f);
        table.addCell(cell);
    }

    private void addLegendCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.BLACK)));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(4f);
        table.addCell(cell);
    }

    private void addBodyCell(PdfPTable table, String text, Color color, boolean bold, boolean continuation) {
        Font font = bold
                ? FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.BLACK)
                : FontFactory.getFont(FontFactory.HELVETICA, 8, Color.BLACK);
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setMinimumHeight(28f);
        cell.setPadding(3f);
        cell.setBackgroundColor(color);
        if (continuation) {
            cell.setBorder(Rectangle.LEFT | Rectangle.RIGHT | Rectangle.BOTTOM);
        } else {
            cell.setBorder(Rectangle.BOX);
        }
        table.addCell(cell);
    }

    private Color colorForType(String courseType) {
        if (courseType == null) {
            return new Color(221, 235, 247);
        }
        return switch (courseType.toUpperCase()) {
            case "CM" -> new Color(68, 114, 196);
            case "TD" -> new Color(112, 173, 71);
            case "TP" -> new Color(237, 125, 49);
            case "EXAM" -> new Color(255, 0, 0);
            default -> new Color(221, 235, 247);
        };
    }

    private String vueLabel(EDT.VueType vue) {
        return switch (vue) {
            case GROUPE -> "Groupe";
            case ENSEIGNANT -> "Enseignant";
            case SALLE -> "Salle";
        };
    }

    private LocalDate mondayOfWeek(int year, int week) {
        return LocalDate.now()
                .withYear(year)
                .with(WeekFields.ISO.weekOfWeekBasedYear(), week)
                .with(WeekFields.ISO.dayOfWeek(), 1);
    }

    private String formatDate(LocalDate date) {
        String month = switch (date.getMonthValue()) {
            case 1 -> "janvier";
            case 2 -> "fevrier";
            case 3 -> "mars";
            case 4 -> "avril";
            case 5 -> "mai";
            case 6 -> "juin";
            case 7 -> "juillet";
            case 8 -> "aout";
            case 9 -> "septembre";
            case 10 -> "octobre";
            case 11 -> "novembre";
            case 12 -> "decembre";
            default -> "";
        };
        return date.getDayOfMonth() + " " + month;
    }
}
