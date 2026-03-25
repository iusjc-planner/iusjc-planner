package com.example.iusj_schedule_service.services;

import com.example.iusj_schedule_service.algorithm.GreedyScheduler;
import com.example.iusj_schedule_service.algorithm.ScheduleAlgorithm;
import com.example.iusj_schedule_service.algorithm.TimeSlot;
import com.example.iusj_schedule_service.dto.GenerationCourseInput;
import com.example.iusj_schedule_service.dto.GenerationRequest;
import com.example.iusj_schedule_service.dto.GenerationResult;
import com.example.iusj_schedule_service.dto.SlotSuggestion;
import com.example.iusj_schedule_service.dto.ValidationRequest;
import com.example.iusj_schedule_service.dto.ValidationResult;
import com.example.iusj_schedule_service.entities.EDT;
import com.example.iusj_schedule_service.entities.ScheduleEntry;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class ScheduleGeneratorService {

    private final ScheduleDataCollector dataCollector;
    private final ScheduleService scheduleService;
    private final EDTService edtService;
    private final ScheduleAlgorithmFactory scheduleAlgorithmFactory;

    public ScheduleGeneratorService(
            ScheduleDataCollector dataCollector,
            ScheduleService scheduleService,
            EDTService edtService,
            ScheduleAlgorithmFactory scheduleAlgorithmFactory
    ) {
        this.dataCollector = dataCollector;
        this.scheduleService = scheduleService;
        this.edtService = edtService;
        this.scheduleAlgorithmFactory = scheduleAlgorithmFactory;
    }

    public GenerationResult generate(GenerationRequest request) {
        long startTime = System.currentTimeMillis();
        int week = request.getSemaine() != null ? request.getSemaine() : 1;
        List<GenerationCourseInput> candidates = dataCollector.collectCandidates(request);
        List<TimeSlot> slots = dataCollector.buildWeekSlots(request.getAnnee(), week);
        List<Long> roomPool = dataCollector.collectRoomPool(request);

        String requestedAlgorithm = request.getAlgorithmType() == null ? "GREEDY" : request.getAlgorithmType();
        ScheduleAlgorithm algorithm = scheduleAlgorithmFactory.create(requestedAlgorithm);

        GreedyScheduler.PlacementResult placementResult;
        String usedAlgorithm = requestedAlgorithm.toUpperCase();

        try {
            placementResult = algorithm.place(candidates, slots, roomPool, (course, slot, roomId, alreadyPlaced) -> {
                ScheduleEntry probe = new ScheduleEntry();
                probe.setCourseId(course.getCourseId());
                probe.setTeacherId(course.getTeacherId());
                probe.setGroupId(course.getGroupId());
                probe.setRoomId(roomId);
                probe.setStartTime(slot.getStart());
                probe.setEndTime(slot.getEnd());

                Integer groupSize = course.getGroupSize() != null ? course.getGroupSize() : request.getDefaultGroupSize();
                Integer roomCapacity = course.getRoomCapacity() != null ? course.getRoomCapacity() : request.getDefaultRoomCapacity();
                List<String> conflicts = scheduleService.validateConflicts(probe, null, groupSize, roomCapacity);

                // Check in-memory conflicts for generated candidates to avoid overlapping tentative placements.
                for (ScheduleEntry existing : alreadyPlaced) {
                    boolean overlaps = existing.getStartTime().isBefore(probe.getEndTime())
                            && probe.getStartTime().isBefore(existing.getEndTime());
                    if (!overlaps) {
                        continue;
                    }
                    if (existing.getTeacherId().equals(probe.getTeacherId())) {
                        conflicts.add("Teacher already tentatively booked for this time range");
                    }
                    if (existing.getGroupId().equals(probe.getGroupId())) {
                        conflicts.add("Group already tentatively booked for this time range");
                    }
                    if (existing.getRoomId().equals(probe.getRoomId())) {
                        conflicts.add("Room already tentatively booked for this time range");
                    }
                }
                return conflicts;
            });
        } catch (Exception ex) {
            ScheduleAlgorithm fallback = new GreedyScheduler();
            placementResult = fallback.place(candidates, slots, roomPool, (course, slot, roomId, alreadyPlaced) -> {
                ScheduleEntry probe = new ScheduleEntry();
                probe.setCourseId(course.getCourseId());
                probe.setTeacherId(course.getTeacherId());
                probe.setGroupId(course.getGroupId());
                probe.setRoomId(roomId);
                probe.setStartTime(slot.getStart());
                probe.setEndTime(slot.getEnd());
                Integer groupSize = course.getGroupSize() != null ? course.getGroupSize() : request.getDefaultGroupSize();
                Integer roomCapacity = course.getRoomCapacity() != null ? course.getRoomCapacity() : request.getDefaultRoomCapacity();
                return scheduleService.validateConflicts(probe, null, groupSize, roomCapacity);
            });
            usedAlgorithm = "GREEDY";
            placementResult.getConflicts().add("Fallback to GREEDY: " + ex.getMessage());
        }

        List<Long> edtIds = new ArrayList<>();
        boolean dryRun = Boolean.TRUE.equals(request.getDryRun());

        for (Long groupId : request.getGroupIds()) {
            EDT edt = edtService.getOrCreate(week, request.getAnnee(), EDT.VueType.GROUPE, groupId, request.getCreePar());
            edtIds.add(edt.getId());

            if (!dryRun) {
                for (GreedyScheduler.PlacedCandidate placed : placementResult.getPlaced()) {
                    if (!groupId.equals(placed.getCourse().getGroupId())) {
                        continue;
                    }
                    ScheduleEntry entry = new ScheduleEntry();
                    entry.setCourseId(placed.getCourse().getCourseId());
                    entry.setTeacherId(placed.getCourse().getTeacherId());
                    entry.setGroupId(placed.getCourse().getGroupId());
                    entry.setRoomId(placed.getRoomId());
                    entry.setStartTime(placed.getSlot().getStart());
                    entry.setEndTime(placed.getSlot().getEnd());
                    edtService.addEntry(edt.getId(), entry);
                }
            }
        }

        GenerationResult result = new GenerationResult();
        result.setEdtIds(edtIds);
        result.setRequested(candidates.size());
        result.setPlaced(placementResult.getPlaced().size());
        result.setUnplaced(placementResult.getUnplaced().size());
        result.setConflicts(placementResult.getConflicts());
        result.setAlgorithmUsed(usedAlgorithm);

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("timeMs", System.currentTimeMillis() - startTime);
        metrics.put("slotCount", slots.size());
        metrics.put("courseCount", candidates.size());
        metrics.put("roomPoolSize", roomPool.size());
        result.setOptimizationMetrics(metrics);

        return result;
    }

    @Transactional(readOnly = true)
    public List<SlotSuggestion> getAvailableSlots(Long teacherId, LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(LocalTime.MAX);

        List<ScheduleEntry> existing = scheduleService.getAll(null, teacherId, null, null, null, start, end);
        List<TimeSlot> daySlots = List.of(
                new TimeSlot(date.atTime(8, 0), date.atTime(10, 0)),
                new TimeSlot(date.atTime(10, 0), date.atTime(12, 0)),
                new TimeSlot(date.atTime(14, 0), date.atTime(16, 0)),
                new TimeSlot(date.atTime(16, 0), date.atTime(18, 0))
        );

        List<SlotSuggestion> suggestions = new ArrayList<>();
        List<Long> suggestedRooms = getSuggestedRooms(null, null);
        Long defaultSuggestedRoom = suggestedRooms.isEmpty() ? 1L : suggestedRooms.get(0);
        for (TimeSlot slot : daySlots) {
            boolean occupied = existing.stream().anyMatch(e -> overlaps(e.getStartTime(), e.getEndTime(), slot.getStart(), slot.getEnd()));
            if (!occupied) {
                SlotSuggestion suggestion = new SlotSuggestion();
                suggestion.setStartTime(slot.getStart());
                suggestion.setEndTime(slot.getEnd());
                suggestion.setRoomId(defaultSuggestedRoom);
                suggestion.setReason("Creneau libre pour l'enseignant");
                suggestions.add(suggestion);
            }
        }
        return suggestions;
    }

    public List<Long> getSuggestedRooms(Integer effectif, List<String> equipments) {
        // Placeholder strategy: returns deterministic room IDs until room-service capability filtering is wired.
        if (effectif != null && effectif > 60) {
            return List.of(3L, 2L, 1L);
        }
        return List.of(1L, 2L, 3L);
    }

    public ValidationResult validateSchedule(Long edtId) {
        List<ScheduleEntry> entries = edtService.getEntries(edtId);
        ValidationResult result = new ValidationResult();

        List<String> conflicts = new ArrayList<>();
        for (ScheduleEntry entry : entries) {
            conflicts.addAll(scheduleService.validateConflicts(entry, entry.getId()));
        }

        result.setValid(conflicts.isEmpty());
        result.setConflicts(conflicts);
        return result;
    }

    public ValidationResult validateEntry(ValidationRequest request) {
        ScheduleEntry entry = new ScheduleEntry();
        entry.setCourseId(request.getCourseId());
        entry.setTeacherId(request.getTeacherId());
        entry.setRoomId(request.getRoomId());
        entry.setGroupId(request.getGroupId());
        entry.setStartTime(request.getStartTime());
        entry.setEndTime(request.getEndTime());

        List<String> conflicts = scheduleService.validateConflicts(
                entry,
                request.getExcludeEntryId(),
                request.getGroupSize(),
                request.getRoomCapacity()
        );

        List<String> warnings = new ArrayList<>();
        if (request.getGroupSize() != null && request.getRoomCapacity() != null) {
            double load = request.getRoomCapacity() == 0 ? 1D : (double) request.getGroupSize() / request.getRoomCapacity();
            if (load >= 0.9D && load <= 1D) {
                warnings.add("Capacite proche de la limite");
            }
        }

        ValidationResult result = new ValidationResult();
        result.setValid(conflicts.isEmpty());
        result.setConflicts(conflicts);
        result.setWarnings(warnings);
        return result;
    }

    private boolean overlaps(LocalDateTime aStart, LocalDateTime aEnd, LocalDateTime bStart, LocalDateTime bEnd) {
        return aStart.isBefore(bEnd) && bStart.isBefore(aEnd);
    }
}
