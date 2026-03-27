package com.example.iusj_schedule_service.algorithm;

import com.example.iusj_schedule_service.dto.GenerationCourseInput;
import com.example.iusj_schedule_service.entities.ScheduleEntry;

import java.util.List;

@FunctionalInterface
public interface ScheduleConstraint {
    List<String> validate(GenerationCourseInput course, TimeSlot slot, Long roomId, List<ScheduleEntry> alreadyPlaced);
}
