package com.example.iusj_schedule_service.services;

import com.example.iusj_schedule_service.algorithm.TimeSlot;
import com.example.iusj_schedule_service.dto.GenerationCourseInput;
import com.example.iusj_schedule_service.dto.GenerationRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.WeekFields;
import java.util.ArrayList;
import java.util.List;

@Service
public class ScheduleDataCollector {

    private final RoomServiceClient roomServiceClient;

    public ScheduleDataCollector(RoomServiceClient roomServiceClient) {
        this.roomServiceClient = roomServiceClient;
    }

    public List<GenerationCourseInput> collectCandidates(GenerationRequest request) {
        if (request.getEntries() == null) {
            return List.of();
        }

        if (request.getGroupIds() == null || request.getGroupIds().isEmpty()) {
            return request.getEntries();
        }

        return request.getEntries().stream()
                .filter(e -> request.getGroupIds().contains(e.getGroupId()))
                .toList();
    }

    public List<TimeSlot> buildWeekSlots(int annee, int semaine) {
        List<TimeSlot> slots = new ArrayList<>();
        LocalDate monday = LocalDate.now()
                .withYear(annee)
                .with(WeekFields.ISO.weekOfWeekBasedYear(), semaine)
                .with(WeekFields.ISO.dayOfWeek(), 1);

        LocalTime[][] templates = new LocalTime[][]{
                {LocalTime.of(8, 0), LocalTime.of(10, 0)},
                {LocalTime.of(10, 0), LocalTime.of(12, 0)},
                {LocalTime.of(14, 0), LocalTime.of(16, 0)},
                {LocalTime.of(16, 0), LocalTime.of(18, 0)}
        };

        for (int day = 0; day < 6; day++) {
            LocalDate current = monday.plusDays(day);
            for (LocalTime[] template : templates) {
                slots.add(new TimeSlot(current.atTime(template[0]), current.atTime(template[1])));
            }
        }
        return slots;
    }

    public List<Long> collectRoomPool(GenerationRequest request) {
        Integer minCapacity = request.getDefaultGroupSize();
        if (Boolean.TRUE.equals(request.getUseRoomStatus())) {
            return roomServiceClient.getActiveRoomIds(minCapacity, List.of());
        }
        return List.of(1L, 2L, 3L);
    }
}
