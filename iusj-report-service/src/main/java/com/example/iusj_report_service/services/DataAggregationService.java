package com.example.iusj_report_service.services;

import com.example.iusj_report_service.client.EventServiceClient;
import com.example.iusj_report_service.client.RoomServiceClient;
import com.example.iusj_report_service.client.ScheduleServiceClient;
import com.example.iusj_report_service.client.SchoolServiceClient;
import com.example.iusj_report_service.client.TeacherServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DataAggregationService {

    private final RoomServiceClient roomServiceClient;
    private final TeacherServiceClient teacherServiceClient;
    private final ScheduleServiceClient scheduleServiceClient;
    private final SchoolServiceClient schoolServiceClient;
    private final EventServiceClient eventServiceClient;

    public List<Map<String, Object>> aggregateRoomOccupation(LocalDate from, LocalDate to, Long salleId) {
        List<Map<String, Object>> entries = scheduleServiceClient.getScheduleEntries(from, to).stream()
            .filter(e -> salleId == null || salleId.equals(asLong(e.get("roomId"))))
            .toList();

        Map<Long, Long> byRoom = new LinkedHashMap<>();
        for (Map<String, Object> entry : entries) {
            Long roomId = asLong(entry.get("roomId"));
            if (roomId == null) {
                continue;
            }
            byRoom.put(roomId, byRoom.getOrDefault(roomId, 0L) + 1L);
        }

        return byRoom.entrySet().stream().map(e -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("roomId", e.getKey());
            row.put("occupiedSlots", e.getValue());
            return row;
        }).toList();
    }

    public List<Map<String, Object>> aggregateTeacherLoad(LocalDate from, LocalDate to, Long teacherId) {
        List<Map<String, Object>> entries = scheduleServiceClient.getScheduleEntries(from, to).stream()
            .filter(e -> teacherId == null || teacherId.equals(asLong(e.get("teacherId"))))
            .toList();

        Map<Long, Long> minutesByTeacher = new LinkedHashMap<>();
        for (Map<String, Object> entry : entries) {
            Long id = asLong(entry.get("teacherId"));
            if (id == null) {
                continue;
            }
            long minutes = estimateMinutes(entry.get("startTime"), entry.get("endTime"));
            minutesByTeacher.put(id, minutesByTeacher.getOrDefault(id, 0L) + minutes);
        }

        return minutesByTeacher.entrySet().stream().map(e -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("teacherId", e.getKey());
            row.put("minutes", e.getValue());
            row.put("hours", Math.round((e.getValue() / 60.0) * 100.0) / 100.0);
            return row;
        }).toList();
    }

    public List<Map<String, Object>> aggregateSchoolStats(Long schoolId) {
        Map<String, Object> stats = schoolServiceClient.getSchoolStats();
        List<Map<String, Object>> schools = schoolServiceClient.getSchools();

        Map<String, Object> row = new LinkedHashMap<>();
        row.put("schoolId", schoolId);
        row.put("stats", stats);
        row.put("schoolCount", schools.size());
        return List.of(row);
    }

    public List<Map<String, Object>> aggregateEvents(LocalDate from, LocalDate to) {
        return eventServiceClient.getEvents(from, to);
    }

    public List<Map<String, Object>> aggregateGlobal(LocalDate from, LocalDate to) {
        List<Map<String, Object>> rooms = roomServiceClient.getRooms();
        List<Map<String, Object>> teachers = teacherServiceClient.getTeachers();
        List<Map<String, Object>> schedule = scheduleServiceClient.getScheduleEntries(from, to);
        List<Map<String, Object>> events = eventServiceClient.getEvents(from, to);

        Map<String, Object> row = new LinkedHashMap<>();
        row.put("rooms", rooms.size());
        row.put("teachers", teachers.size());
        row.put("scheduleEntries", schedule.size());
        row.put("events", events.size());
        return List.of(row);
    }

    private Long asLong(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.longValue();
        }
        return Long.parseLong(value.toString());
    }

    private long estimateMinutes(Object start, Object end) {
        if (start == null || end == null) {
            return 60;
        }
        try {
            String startText = start.toString();
            String endText = end.toString();
            int sh = Integer.parseInt(startText.substring(11, 13));
            int sm = Integer.parseInt(startText.substring(14, 16));
            int eh = Integer.parseInt(endText.substring(11, 13));
            int em = Integer.parseInt(endText.substring(14, 16));
            int minutes = (eh * 60 + em) - (sh * 60 + sm);
            return Math.max(minutes, 30);
        } catch (Exception ex) {
            return 60;
        }
    }
}
