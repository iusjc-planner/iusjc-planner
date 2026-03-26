package com.example.iusj_schedule_service.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class ValidationRequest {

    @NotNull
    private Long courseId;

    @NotNull
    private Long teacherId;

    @NotNull
    private Long roomId;

    @NotNull
    private Long groupId;

    @NotNull
    private LocalDateTime startTime;

    @NotNull
    private LocalDateTime endTime;

    private Integer groupSize;

    private Integer roomCapacity;

    private Long excludeEntryId;

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public Long getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(Long teacherId) {
        this.teacherId = teacherId;
    }

    public Long getRoomId() {
        return roomId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public Integer getGroupSize() {
        return groupSize;
    }

    public void setGroupSize(Integer groupSize) {
        this.groupSize = groupSize;
    }

    public Integer getRoomCapacity() {
        return roomCapacity;
    }

    public void setRoomCapacity(Integer roomCapacity) {
        this.roomCapacity = roomCapacity;
    }

    public Long getExcludeEntryId() {
        return excludeEntryId;
    }

    public void setExcludeEntryId(Long excludeEntryId) {
        this.excludeEntryId = excludeEntryId;
    }
}
