package com.example.iusj_schedule_service.dto;

import com.example.iusj_schedule_service.entities.EDT;
import jakarta.validation.constraints.NotNull;

import java.util.ArrayList;
import java.util.List;

public class GenerationRequest {

    private Integer semaine;

    @NotNull
    private Integer annee;

    @NotNull
    private EDT.PeriodeType periode;

    private List<Long> groupIds = new ArrayList<>();

    private List<GenerationCourseInput> entries = new ArrayList<>();

    private Boolean dryRun = false;

    private Long creePar;

    private Integer defaultGroupSize;

    private Integer defaultRoomCapacity;

    private String algorithmType = "GREEDY";

    private Boolean teacherAvailabilityRequired = false;

    private Boolean useRoomStatus = false;

    private Integer maxRunTimeSeconds = 30;

    public Integer getSemaine() {
        return semaine;
    }

    public void setSemaine(Integer semaine) {
        this.semaine = semaine;
    }

    public Integer getAnnee() {
        return annee;
    }

    public void setAnnee(Integer annee) {
        this.annee = annee;
    }

    public EDT.PeriodeType getPeriode() {
        return periode;
    }

    public void setPeriode(EDT.PeriodeType periode) {
        this.periode = periode;
    }

    public List<Long> getGroupIds() {
        return groupIds;
    }

    public void setGroupIds(List<Long> groupIds) {
        this.groupIds = groupIds;
    }

    public List<GenerationCourseInput> getEntries() {
        return entries;
    }

    public void setEntries(List<GenerationCourseInput> entries) {
        this.entries = entries;
    }

    public Boolean getDryRun() {
        return dryRun;
    }

    public void setDryRun(Boolean dryRun) {
        this.dryRun = dryRun;
    }

    public Long getCreePar() {
        return creePar;
    }

    public void setCreePar(Long creePar) {
        this.creePar = creePar;
    }

    public Integer getDefaultGroupSize() {
        return defaultGroupSize;
    }

    public void setDefaultGroupSize(Integer defaultGroupSize) {
        this.defaultGroupSize = defaultGroupSize;
    }

    public Integer getDefaultRoomCapacity() {
        return defaultRoomCapacity;
    }

    public void setDefaultRoomCapacity(Integer defaultRoomCapacity) {
        this.defaultRoomCapacity = defaultRoomCapacity;
    }

    public String getAlgorithmType() {
        return algorithmType;
    }

    public void setAlgorithmType(String algorithmType) {
        this.algorithmType = algorithmType;
    }

    public Boolean getTeacherAvailabilityRequired() {
        return teacherAvailabilityRequired;
    }

    public void setTeacherAvailabilityRequired(Boolean teacherAvailabilityRequired) {
        this.teacherAvailabilityRequired = teacherAvailabilityRequired;
    }

    public Boolean getUseRoomStatus() {
        return useRoomStatus;
    }

    public void setUseRoomStatus(Boolean useRoomStatus) {
        this.useRoomStatus = useRoomStatus;
    }

    public Integer getMaxRunTimeSeconds() {
        return maxRunTimeSeconds;
    }

    public void setMaxRunTimeSeconds(Integer maxRunTimeSeconds) {
        this.maxRunTimeSeconds = maxRunTimeSeconds;
    }
}
