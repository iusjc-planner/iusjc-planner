package com.example.iusj_schedule_service.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class GenerationResult {

    private List<Long> edtIds = new ArrayList<>();
    private int requested;
    private int placed;
    private int unplaced;
    private List<String> conflicts = new ArrayList<>();
    private String algorithmUsed;
    private Map<String, Object> optimizationMetrics;

    public List<Long> getEdtIds() {
        return edtIds;
    }

    public void setEdtIds(List<Long> edtIds) {
        this.edtIds = edtIds;
    }

    public int getRequested() {
        return requested;
    }

    public void setRequested(int requested) {
        this.requested = requested;
    }

    public int getPlaced() {
        return placed;
    }

    public void setPlaced(int placed) {
        this.placed = placed;
    }

    public int getUnplaced() {
        return unplaced;
    }

    public void setUnplaced(int unplaced) {
        this.unplaced = unplaced;
    }

    public List<String> getConflicts() {
        return conflicts;
    }

    public void setConflicts(List<String> conflicts) {
        this.conflicts = conflicts;
    }

    public String getAlgorithmUsed() {
        return algorithmUsed;
    }

    public void setAlgorithmUsed(String algorithmUsed) {
        this.algorithmUsed = algorithmUsed;
    }

    public Map<String, Object> getOptimizationMetrics() {
        return optimizationMetrics;
    }

    public void setOptimizationMetrics(Map<String, Object> optimizationMetrics) {
        this.optimizationMetrics = optimizationMetrics;
    }
}
