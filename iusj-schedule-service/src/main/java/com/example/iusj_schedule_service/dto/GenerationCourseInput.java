package com.example.iusj_schedule_service.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class GenerationCourseInput {

    private Long id;

    @NotNull
    private Long courseId;

    @NotNull
    private Long teacherId;

    @NotNull
    private Long groupId;

    private Long preferredRoomId;

    private Integer groupSize;

    private Integer roomCapacity;

    private LocalDateTime fixedStartTime;

    private LocalDateTime fixedEndTime;

    private String courseType;

    private String courseTitle;

    private String subjectName;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }

    public Long getPreferredRoomId() {
        return preferredRoomId;
    }

    public void setPreferredRoomId(Long preferredRoomId) {
        this.preferredRoomId = preferredRoomId;
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

    public LocalDateTime getFixedStartTime() {
        return fixedStartTime;
    }

    public void setFixedStartTime(LocalDateTime fixedStartTime) {
        this.fixedStartTime = fixedStartTime;
    }

    public LocalDateTime getFixedEndTime() {
        return fixedEndTime;
    }

    public void setFixedEndTime(LocalDateTime fixedEndTime) {
        this.fixedEndTime = fixedEndTime;
    }

    public String getCourseType() {
        return courseType;
    }

    public void setCourseType(String courseType) {
        this.courseType = courseType;
    }

    public String getCourseTitle() {
        return courseTitle;
    }

    public void setCourseTitle(String courseTitle) {
        this.courseTitle = courseTitle;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

    public boolean hasFixedSlot() {
        return fixedStartTime != null && fixedEndTime != null;
    }
}
