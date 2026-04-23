package com.example.iusj_schedule_service.services.export;

import com.example.iusj_schedule_service.dto.EDTExportData;
import com.example.iusj_schedule_service.entities.EDT;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

/**
 * Service d'export au format iCalendar (.ics) pour synchronisation
 * avec Google Calendar, Outlook, Apple Calendar, etc.
 */
@Service
public class IcsExportService {

    private static final DateTimeFormatter ICS_DT_FMT = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'");
    private static final ZoneId UTC = ZoneId.of("UTC");

    /**
     * Génère un fichier .ics à partir des données d'un EDT.
     */
    public byte[] exportToIcs(EDT edt, EDTExportData exportData) {
        StringBuilder sb = new StringBuilder();

        sb.append("BEGIN:VCALENDAR\r\n");
        sb.append("VERSION:2.0\r\n");
        sb.append("PRODID:-//IUSJ Planner//FR\r\n");
        sb.append("CALSCALE:GREGORIAN\r\n");
        sb.append("METHOD:PUBLISH\r\n");
        sb.append("X-WR-CALNAME:IUSJ Planner - EDT\r\n");
        sb.append("X-WR-TIMEZONE:Africa/Kinshasa\r\n");

        List<EDTExportData.ExportEntry> entries = exportData.getEntries();
        if (entries != null) {
            for (EDTExportData.ExportEntry entry : entries) {
                appendVEvent(sb, entry, edt);
            }
        }

        sb.append("END:VCALENDAR\r\n");

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private void appendVEvent(StringBuilder sb, EDTExportData.ExportEntry entry, EDT edt) {
        if (entry.getStartTime() == null || entry.getEndTime() == null) return;

        String uid = UUID.randomUUID() + "@iusj-planner";
        String dtStart = toIcsDateTime(entry.getStartTime());
        String dtEnd = toIcsDateTime(entry.getEndTime());
        String now = toIcsDateTime(LocalDateTime.now());

        String summary = entry.getCourseLabel() != null ? entry.getCourseLabel() : "Cours";
        String location = entry.getRoomLabel() != null ? entry.getRoomLabel() : "";
        String description = buildDescription(entry);

        sb.append("BEGIN:VEVENT\r\n");
        sb.append("UID:").append(uid).append("\r\n");
        sb.append("DTSTAMP:").append(now).append("\r\n");
        sb.append("DTSTART:").append(dtStart).append("\r\n");
        sb.append("DTEND:").append(dtEnd).append("\r\n");
        sb.append("SUMMARY:").append(escapeIcs(summary)).append("\r\n");
        if (!location.isBlank()) {
            sb.append("LOCATION:").append(escapeIcs(location)).append("\r\n");
        }
        if (!description.isBlank()) {
            sb.append("DESCRIPTION:").append(escapeIcs(description)).append("\r\n");
        }
        sb.append("STATUS:CONFIRMED\r\n");
        sb.append("END:VEVENT\r\n");
    }

    private String buildDescription(EDTExportData.ExportEntry entry) {
        StringBuilder desc = new StringBuilder();
        if (entry.getTeacherLabel() != null) {
            desc.append("Enseignant: ").append(entry.getTeacherLabel());
        }
        if (entry.getGroupLabel() != null) {
            if (desc.length() > 0) desc.append("\\n");
            desc.append("Groupe: ").append(entry.getGroupLabel());
        }
        if (entry.getCourseType() != null) {
            if (desc.length() > 0) desc.append("\\n");
            desc.append("Type: ").append(entry.getCourseType());
        }
        return desc.toString();
    }

    private String toIcsDateTime(LocalDateTime ldt) {
        return ldt.atZone(ZoneId.of("Africa/Kinshasa"))
                  .withZoneSameInstant(UTC)
                  .format(ICS_DT_FMT);
    }

    private String escapeIcs(String value) {
        if (value == null) return "";
        return value.replace("\\", "\\\\")
                    .replace(";", "\\;")
                    .replace(",", "\\,")
                    .replace("\n", "\\n")
                    .replace("\r", "");
    }
}
