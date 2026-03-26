package com.example.iusj_schedule_service.services.export;

import com.example.iusj_schedule_service.entities.EDT;
import com.example.iusj_schedule_service.entities.ScheduleEntry;
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
import java.time.LocalDateTime;
import java.time.temporal.WeekFields;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
public class PdfExportService {

    public byte[] exportWeeklyEdtPdf(EDT edt, List<ScheduleEntry> entries) {
        try {
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4.rotate(), 20f, 20f, 20f, 20f);
            PdfWriter.getInstance(document, output);
            document.open();

            addHeader(document, edt);
            addGrid(document, edt, entries);

            document.close();
            return output.toByteArray();
        } catch (DocumentException e) {
            throw new IllegalStateException("Erreur lors de la generation PDF", e);
        }
    }

    private void addHeader(Document document, EDT edt) throws DocumentException {
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.DARK_GRAY);
        Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 11, Color.BLACK);

        Paragraph org = new Paragraph("INSTITUT UNIVERSITAIRE SAINT JEAN", titleFont);
        org.setAlignment(Element.ALIGN_CENTER);
        document.add(org);

        Paragraph subOrg = new Paragraph("SAINT JEAN INGENIEUR", subtitleFont);
        subOrg.setAlignment(Element.ALIGN_CENTER);
        document.add(subOrg);

        document.add(new Paragraph(" "));

        String vueLabel = switch (edt.getVue()) {
            case GROUPE -> "Groupe";
            case ENSEIGNANT -> "Enseignant";
            case SALLE -> "Salle";
        };

        LocalDate monday = mondayOfWeek(edt.getAnnee(), edt.getSemaine());
        LocalDate saturday = monday.plusDays(5);
        String weekLabel = String.format("Semaine %d (%s au %s)",
            edt.getSemaine(),
            monday.getDayOfMonth() + " " + monthNameFr(monday.getMonthValue()),
            saturday.getDayOfMonth() + " " + monthNameFr(saturday.getMonthValue()));

        Paragraph context = new Paragraph(
            String.format("Emploi de temps %d - %s %d - %s", edt.getAnnee(), vueLabel, edt.getTargetId(), weekLabel),
            FontFactory.getFont(FontFactory.HELVETICA, 14, Color.BLACK)
        );
        context.setAlignment(Element.ALIGN_CENTER);
        document.add(context);

        document.add(new Paragraph(" "));
    }

    private void addGrid(Document document, EDT edt, List<ScheduleEntry> entries) throws DocumentException {
        PdfPTable table = new PdfPTable(7);
        table.setWidthPercentage(100f);
        table.setWidths(new float[]{1.2f, 2f, 2f, 2f, 2f, 2f, 2f});

        addHeaderCell(table, "HORAIRES", new Color(230, 230, 230));
        addHeaderCell(table, "Lundi", new Color(230, 230, 230));
        addHeaderCell(table, "Mardi", new Color(230, 230, 230));
        addHeaderCell(table, "Mercredi", new Color(230, 230, 230));
        addHeaderCell(table, "Jeudi", new Color(230, 230, 230));
        addHeaderCell(table, "Vendredi", new Color(230, 230, 230));
        addHeaderCell(table, "Samedi", new Color(230, 230, 230));

        List<Integer> slots = List.of(8, 9, 10, 11, 12, 13, 14, 15, 16);
        for (Integer hour : slots) {
            addHeaderCell(table, hour + ":00 - " + (hour + 1) + ":00", Color.WHITE);

            for (DayOfWeek day : workdays()) {
                if (hour == 12) {
                    addBodyCell(table, "PAUSE", new Color(146, 208, 80));
                    continue;
                }

                List<ScheduleEntry> matched = entries.stream()
                    .filter(e -> e.getStartTime() != null && e.getEndTime() != null)
                    .filter(e -> e.getStartTime().toLocalDate().getDayOfWeek() == day)
                    .filter(e -> e.getStartTime().getHour() <= hour && e.getEndTime().getHour() > hour)
                    .sorted(Comparator.comparing(ScheduleEntry::getStartTime))
                    .toList();

                if (matched.isEmpty()) {
                    addBodyCell(table, "", Color.WHITE);
                } else {
                    StringBuilder sb = new StringBuilder();
                    for (ScheduleEntry entry : matched) {
                        sb.append(formatEntry(entry)).append("\n");
                    }
                    Color cellColor = colorForCourse(matched.get(0).getCourseId());
                    addBodyCell(table, sb.toString().trim(), cellColor);
                }
            }
        }

        document.add(table);
    }

    private String formatEntry(ScheduleEntry entry) {
        String time = String.format("%02dh-%02dh", entry.getStartTime().getHour(), entry.getEndTime().getHour());
        return String.format("%s\nCours #%d\nEns #%d - Salle #%d",
            time,
            entry.getCourseId(),
            entry.getTeacherId(),
            entry.getRoomId());
    }

    private void addHeaderCell(PdfPTable table, String text, Color color) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.BLACK)));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(8f);
        cell.setBackgroundColor(color);
        table.addCell(cell);
    }

    private void addBodyCell(PdfPTable table, String text, Color color) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK)));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setMinimumHeight(40f);
        cell.setPadding(4f);
        cell.setBackgroundColor(color);
        cell.setBorder(Rectangle.BOX);
        table.addCell(cell);
    }

    private List<DayOfWeek> workdays() {
        List<DayOfWeek> days = new ArrayList<>();
        days.add(DayOfWeek.MONDAY);
        days.add(DayOfWeek.TUESDAY);
        days.add(DayOfWeek.WEDNESDAY);
        days.add(DayOfWeek.THURSDAY);
        days.add(DayOfWeek.FRIDAY);
        days.add(DayOfWeek.SATURDAY);
        return days;
    }

    private Color colorForCourse(Long courseId) {
        if (courseId == null) {
            return new Color(221, 235, 247);
        }
        int idx = (int) (Math.abs(courseId) % 6);
        return switch (idx) {
            case 0 -> new Color(56, 118, 29);
            case 1 -> new Color(87, 12, 54);
            case 2 -> new Color(180, 120, 160);
            case 3 -> new Color(29, 20, 214);
            case 4 -> new Color(103, 78, 167);
            default -> new Color(224, 102, 102);
        };
    }

    private LocalDate mondayOfWeek(int year, int week) {
        return LocalDate.now()
            .withYear(year)
            .with(WeekFields.ISO.weekOfWeekBasedYear(), week)
            .with(WeekFields.ISO.dayOfWeek(), 1);
    }

    private String monthNameFr(int month) {
        return switch (month) {
            case 1 -> "jan";
            case 2 -> "fev";
            case 3 -> "mars";
            case 4 -> "avr";
            case 5 -> "mai";
            case 6 -> "juin";
            case 7 -> "juil";
            case 8 -> "aout";
            case 9 -> "sept";
            case 10 -> "oct";
            case 11 -> "nov";
            case 12 -> "dec";
            default -> "";
        };
    }
}
