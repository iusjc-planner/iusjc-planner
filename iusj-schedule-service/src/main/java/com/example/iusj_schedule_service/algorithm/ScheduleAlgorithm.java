package com.example.iusj_schedule_service.algorithm;

import com.example.iusj_schedule_service.dto.GenerationCourseInput;

import java.util.List;

public interface ScheduleAlgorithm {
    GreedyScheduler.PlacementResult place(
            List<GenerationCourseInput> courses,
            List<TimeSlot> slots,
            List<Long> roomPool,
            ScheduleConstraint constraint
    );
}
