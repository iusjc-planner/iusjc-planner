package com.example.iusj_schedule_service.services;

import com.example.iusj_schedule_service.algorithm.FordFulkersonScheduler;
import com.example.iusj_schedule_service.algorithm.GreedyScheduler;
import com.example.iusj_schedule_service.algorithm.ScheduleAlgorithm;
import org.springframework.stereotype.Component;

@Component
public class ScheduleAlgorithmFactory {

    public ScheduleAlgorithm create(String algorithmType) {
        if ("FORD_FULKERSON".equalsIgnoreCase(algorithmType)) {
            return new FordFulkersonScheduler();
        }
        return new GreedyScheduler();
    }
}
