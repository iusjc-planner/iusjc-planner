package com.example.iusj_schedule_service.services;

import com.example.iusj_schedule_service.algorithm.TimeSlot;
import com.example.iusj_schedule_service.client.CourseCatalogClient;
import com.example.iusj_schedule_service.dto.GenerationCourseInput;
import com.example.iusj_schedule_service.dto.GenerationRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.WeekFields;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

@Service
public class ScheduleDataCollector {

    private final RoomServiceClient roomServiceClient;
    private final CourseCatalogClient courseCatalogClient;

    public ScheduleDataCollector(RoomServiceClient roomServiceClient, CourseCatalogClient courseCatalogClient) {
        this.roomServiceClient = roomServiceClient;
        this.courseCatalogClient = courseCatalogClient;
    }

    public CandidateCollection collectCandidates(GenerationRequest request) {
        List<GenerationCourseInput> manualEntries = request.getEntries() == null ? List.of() : request.getEntries();
        if (!manualEntries.isEmpty()) {
            List<GenerationCourseInput> filtered = applyGroupFilter(manualEntries, request.getGroupIds());
            Set<Long> groups = new TreeSet<>();
            for (GenerationCourseInput candidate : filtered) {
                if (candidate.getGroupId() != null) {
                    groups.add(candidate.getGroupId());
                }
            }
            return new CandidateCollection(filtered, new ArrayList<>(), groups, filtered.size());
        }

        int week = request.getSemaine() != null ? request.getSemaine() : 1;
        LocalDate monday = LocalDate.now()
                .withYear(request.getAnnee())
                .with(WeekFields.ISO.weekOfWeekBasedYear(), week)
                .with(WeekFields.ISO.dayOfWeek(), 1);
        LocalDate saturday = monday.plusDays(5);

        List<CourseCatalogClient.CourseSummary> courses = courseCatalogClient.getCoursesByDateRange(
                monday,
                saturday,
                List.of("SCHEDULED", "POSTPONED")
        );

        List<CourseCatalogClient.CourseSummary> filteredCourses = applyCourseGroupFilter(courses, request.getGroupIds());
        Map<Long, CourseCatalogClient.MatiereSummary> matieres = new HashMap<>();
        List<GenerationCourseInput> candidates = new ArrayList<>();
        List<String> rejected = new ArrayList<>();
        Set<Long> groups = new TreeSet<>();

        for (CourseCatalogClient.CourseSummary course : filteredCourses) {
            Long courseId = course.id();
            if (course.groupId() == null) {
                rejected.add("courseId=" + courseId + " reason=missing_group");
                continue;
            }

            Long teacherId = course.teacherId();
            CourseCatalogClient.MatiereSummary matiere = null;
            if (course.matiereId() != null) {
                matiere = matieres.computeIfAbsent(course.matiereId(), courseCatalogClient::getMatiere);
            }
            if (teacherId == null && matiere != null) {
                teacherId = matiere.teacherId();
            }

            if (teacherId == null) {
                rejected.add("courseId=" + courseId + " reason=missing_teacher");
                continue;
            }

            GenerationCourseInput input = new GenerationCourseInput();
            input.setId(course.id());
            input.setCourseId(course.id());
            input.setGroupId(course.groupId());
            input.setTeacherId(teacherId);
            input.setPreferredRoomId(course.roomId());
            input.setCourseType(course.type());
            input.setCourseTitle(course.title());
            input.setSubjectName(matiere == null ? null : matiere.nom());

            if (course.date() != null && course.startTime() != null && course.endTime() != null) {
                LocalDateTime start = course.date().atTime(course.startTime());
                LocalDateTime end = course.date().atTime(course.endTime());
                if (end.isAfter(start)) {
                    input.setFixedStartTime(start);
                    input.setFixedEndTime(end);
                }
            }

            candidates.add(input);
            groups.add(input.getGroupId());
        }

        return new CandidateCollection(candidates, rejected, groups, filteredCourses.size());
    }

    private List<GenerationCourseInput> applyGroupFilter(List<GenerationCourseInput> entries, List<Long> groupIds) {
        if (groupIds == null || groupIds.isEmpty()) {
            return entries;
        }
        return entries.stream()
                .filter(e -> e.getGroupId() != null && groupIds.contains(e.getGroupId()))
                .toList();
    }

    private List<CourseCatalogClient.CourseSummary> applyCourseGroupFilter(List<CourseCatalogClient.CourseSummary> entries, List<Long> groupIds) {
        if (groupIds == null || groupIds.isEmpty()) {
            return entries;
        }
        return entries.stream()
                .filter(e -> e.groupId() != null && groupIds.contains(e.groupId()))
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
        List<Long> roomIds = roomServiceClient.getActiveRoomIds(minCapacity, List.of());
        if (!roomIds.isEmpty()) {
            return roomIds;
        }
        return List.of(1L, 2L, 3L);
    }

    public record CandidateCollection(
            List<GenerationCourseInput> candidates,
            List<String> rejected,
            Set<Long> discoveredGroupIds,
            int requestedCount
    ) {
    }
}
