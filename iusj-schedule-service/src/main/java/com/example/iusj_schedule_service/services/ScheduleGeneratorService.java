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
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

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

        ScheduleDataCollector.CandidateCollection collection = dataCollector.collectCandidates(request);
        List<GenerationCourseInput> candidates = collection.candidates();
        List<TimeSlot> slots = dataCollector.buildWeekSlots(request.getAnnee(), week);
        List<Long> roomPool = dataCollector.collectRoomPool(request);

        Set<Long> targetGroupIds = resolveTargetGroups(request, collection, candidates);
        boolean dryRun = Boolean.TRUE.equals(request.getDryRun());
        long replacedEntries = 0L;

        if (!dryRun && !targetGroupIds.isEmpty()) {
            replacedEntries = edtService.clearEntriesForGroups(request.getAnnee(), week, targetGroupIds);
        }

        List<GenerationCourseInput> fixedCandidates = candidates.stream()
                .filter(GenerationCourseInput::hasFixedSlot)
                .sorted((a, b) -> a.getFixedStartTime().compareTo(b.getFixedStartTime()))
                .toList();
        List<GenerationCourseInput> flexibleCandidates = candidates.stream()
                .filter(c -> !c.hasFixedSlot())
                .toList();

        List<GreedyScheduler.PlacedCandidate> accepted = new ArrayList<>();
        List<GenerationCourseInput> unplaced = new ArrayList<>();
        List<String> conflicts = new ArrayList<>(collection.rejected());
        List<ScheduleEntry> alreadyPlaced = new ArrayList<>();

        placeFixedCandidates(fixedCandidates, roomPool, alreadyPlaced, accepted, unplaced, conflicts, request);

        String requestedAlgorithm = request.getAlgorithmType() == null ? "GREEDY" : request.getAlgorithmType();
        String usedAlgorithm = requestedAlgorithm.toUpperCase();

        if (!flexibleCandidates.isEmpty()) {
            ScheduleAlgorithm algorithm = scheduleAlgorithmFactory.create(requestedAlgorithm);
            GreedyScheduler.PlacementResult placementResult;
            try {
                placementResult = algorithm.place(flexibleCandidates, slots, roomPool, (course, slot, roomId, tentative) -> {
                    List<ScheduleEntry> combined = new ArrayList<>(alreadyPlaced);
                    combined.addAll(tentative);
                    List<String> rawErrors = validateCandidateRaw(course, slot, roomId, combined, request);
                    return prefixConflicts(course.getCourseId(), rawErrors);
                });
            } catch (Exception ex) {
                ScheduleAlgorithm fallback = new GreedyScheduler();
                placementResult = fallback.place(flexibleCandidates, slots, roomPool, (course, slot, roomId, tentative) -> {
                    List<ScheduleEntry> combined = new ArrayList<>(alreadyPlaced);
                    combined.addAll(tentative);
                    List<String> rawErrors = validateCandidateRaw(course, slot, roomId, combined, request);
                    return prefixConflicts(course.getCourseId(), rawErrors);
                });
                usedAlgorithm = "GREEDY";
                placementResult.getConflicts().add("generation=fallback algorithm=GREEDY reason=" + ex.getMessage());
            }

            for (GreedyScheduler.PlacedCandidate placed : placementResult.getPlaced()) {
                accepted.add(placed);
                alreadyPlaced.add(toScheduleEntry(placed.getCourse(), placed.getSlot(), placed.getRoomId()));
            }
            unplaced.addAll(placementResult.getUnplaced());
            conflicts.addAll(placementResult.getConflicts());
        }

        List<Long> edtIds = persistGeneration(request, week, dryRun, targetGroupIds, accepted);

        GenerationResult result = new GenerationResult();
        result.setEdtIds(edtIds);
        result.setRequested(collection.requestedCount());
        result.setPlaced(accepted.size());
        result.setUnplaced(Math.max(0, collection.requestedCount() - accepted.size()));
        result.setConflicts(deduplicate(conflicts));
        result.setAlgorithmUsed(usedAlgorithm);

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("timeMs", System.currentTimeMillis() - startTime);
        metrics.put("slotCount", slots.size());
        metrics.put("courseCount", candidates.size());
        metrics.put("roomPoolSize", roomPool.size());
        metrics.put("fixedCount", fixedCandidates.size());
        metrics.put("flexibleCount", flexibleCandidates.size());
        metrics.put("rejectedCount", collection.rejected().size());
        metrics.put("replacedEntries", replacedEntries);
        metrics.put("targetGroupCount", targetGroupIds.size());
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

    private void placeFixedCandidates(
            List<GenerationCourseInput> fixedCandidates,
            List<Long> roomPool,
            List<ScheduleEntry> alreadyPlaced,
            List<GreedyScheduler.PlacedCandidate> accepted,
            List<GenerationCourseInput> unplaced,
            List<String> conflicts,
            GenerationRequest request
    ) {
        for (GenerationCourseInput candidate : fixedCandidates) {
            TimeSlot fixedSlot = new TimeSlot(candidate.getFixedStartTime(), candidate.getFixedEndTime());
            if (candidate.getPreferredRoomId() != null) {
                List<String> rawErrors = validateCandidateRaw(
                        candidate,
                        fixedSlot,
                        candidate.getPreferredRoomId(),
                        alreadyPlaced,
                        request
                );
                if (rawErrors.isEmpty()) {
                    GreedyScheduler.PlacedCandidate placed = new GreedyScheduler.PlacedCandidate(candidate, fixedSlot, candidate.getPreferredRoomId());
                    accepted.add(placed);
                    alreadyPlaced.add(toScheduleEntry(candidate, fixedSlot, candidate.getPreferredRoomId()));
                } else {
                    unplaced.add(candidate);
                    conflicts.addAll(prefixConflicts(candidate.getCourseId(), rawErrors));
                }
                continue;
            }

            Long selectedRoom = null;
            List<String> mergedErrors = new ArrayList<>();
            for (Long roomId : roomPool) {
                List<String> rawErrors = validateCandidateRaw(candidate, fixedSlot, roomId, alreadyPlaced, request);
                if (rawErrors.isEmpty()) {
                    selectedRoom = roomId;
                    break;
                }
                mergedErrors.addAll(rawErrors);
            }

            if (selectedRoom == null) {
                unplaced.add(candidate);
                if (mergedErrors.isEmpty()) {
                    mergedErrors.add("fixed_slot_no_available_room");
                }
                conflicts.addAll(prefixConflicts(candidate.getCourseId(), mergedErrors));
                continue;
            }

            GreedyScheduler.PlacedCandidate placed = new GreedyScheduler.PlacedCandidate(candidate, fixedSlot, selectedRoom);
            accepted.add(placed);
            alreadyPlaced.add(toScheduleEntry(candidate, fixedSlot, selectedRoom));
        }
    }

    private List<Long> persistGeneration(
            GenerationRequest request,
            int week,
            boolean dryRun,
            Set<Long> targetGroupIds,
            List<GreedyScheduler.PlacedCandidate> accepted
    ) {
        if (dryRun) {
            return List.of();
        }

        Set<Long> groups = new TreeSet<>(targetGroupIds);
        for (GreedyScheduler.PlacedCandidate placed : accepted) {
            if (placed.getCourse().getGroupId() != null) {
                groups.add(placed.getCourse().getGroupId());
            }
        }

        Map<Long, EDT> groupEdts = new HashMap<>();
        Set<Long> edtIds = new HashSet<>();
        for (Long groupId : groups) {
            EDT edt = edtService.getOrCreate(week, request.getAnnee(), EDT.VueType.GROUPE, groupId, request.getCreePar());
            groupEdts.put(groupId, edt);
            edtIds.add(edt.getId());
        }

        Set<Long> teacherIds = new TreeSet<>();
        Set<Long> roomIds = new TreeSet<>();
        for (GreedyScheduler.PlacedCandidate placed : accepted) {
            GenerationCourseInput course = placed.getCourse();
            EDT groupEdt = groupEdts.get(course.getGroupId());
            if (groupEdt == null) {
                continue;
            }
            edtService.addEntry(groupEdt.getId(), toScheduleEntry(course, placed.getSlot(), placed.getRoomId()));
            if (course.getTeacherId() != null) {
                teacherIds.add(course.getTeacherId());
            }
            if (placed.getRoomId() != null) {
                roomIds.add(placed.getRoomId());
            }
        }

        for (Long teacherId : teacherIds) {
            EDT edt = edtService.getOrCreate(week, request.getAnnee(), EDT.VueType.ENSEIGNANT, teacherId, request.getCreePar());
            edtIds.add(edt.getId());
        }
        for (Long roomId : roomIds) {
            EDT edt = edtService.getOrCreate(week, request.getAnnee(), EDT.VueType.SALLE, roomId, request.getCreePar());
            edtIds.add(edt.getId());
        }

        List<Long> sorted = new ArrayList<>(edtIds);
        sorted.sort(Long::compareTo);
        return sorted;
    }

    private Set<Long> resolveTargetGroups(
            GenerationRequest request,
            ScheduleDataCollector.CandidateCollection collection,
            List<GenerationCourseInput> candidates
    ) {
        Set<Long> groups = new TreeSet<>();
        if (request.getGroupIds() != null && !request.getGroupIds().isEmpty()) {
            groups.addAll(request.getGroupIds());
        }
        groups.addAll(collection.discoveredGroupIds());
        for (GenerationCourseInput candidate : candidates) {
            if (candidate.getGroupId() != null) {
                groups.add(candidate.getGroupId());
            }
        }
        return groups;
    }

    private List<String> validateCandidateRaw(
            GenerationCourseInput course,
            TimeSlot slot,
            Long roomId,
            List<ScheduleEntry> alreadyPlaced,
            GenerationRequest request
    ) {
        ScheduleEntry probe = toScheduleEntry(course, slot, roomId);
        Integer groupSize = course.getGroupSize() != null ? course.getGroupSize() : request.getDefaultGroupSize();
        Integer roomCapacity = course.getRoomCapacity() != null ? course.getRoomCapacity() : request.getDefaultRoomCapacity();
        List<String> conflicts = scheduleService.validateConflicts(probe, null, groupSize, roomCapacity);

        for (ScheduleEntry existing : alreadyPlaced) {
            boolean overlaps = overlaps(existing.getStartTime(), existing.getEndTime(), probe.getStartTime(), probe.getEndTime());
            if (!overlaps) {
                continue;
            }

            if (existing.getTeacherId() != null && existing.getTeacherId().equals(probe.getTeacherId())) {
                conflicts.add("teacher_conflict_tentative");
            }
            if (existing.getGroupId() != null && existing.getGroupId().equals(probe.getGroupId())) {
                conflicts.add("group_conflict_tentative");
            }
            if (existing.getRoomId() != null && existing.getRoomId().equals(probe.getRoomId())) {
                conflicts.add("room_conflict_tentative");
            }
        }

        return deduplicate(conflicts);
    }

    private ScheduleEntry toScheduleEntry(GenerationCourseInput course, TimeSlot slot, Long roomId) {
        ScheduleEntry entry = new ScheduleEntry();
        entry.setCourseId(course.getCourseId());
        entry.setTeacherId(course.getTeacherId());
        entry.setGroupId(course.getGroupId());
        entry.setRoomId(roomId);
        entry.setStartTime(slot.getStart());
        entry.setEndTime(slot.getEnd());
        return entry;
    }

    private List<String> prefixConflicts(Long courseId, List<String> errors) {
        if (errors.isEmpty()) {
            return List.of();
        }
        List<String> prefixed = new ArrayList<>();
        for (String error : errors) {
            prefixed.add("courseId=" + courseId + " reason=" + error);
        }
        return prefixed;
    }

    private List<String> deduplicate(List<String> values) {
        return new ArrayList<>(new TreeSet<>(values));
    }

    private boolean overlaps(LocalDateTime aStart, LocalDateTime aEnd, LocalDateTime bStart, LocalDateTime bEnd) {
        return aStart.isBefore(bEnd) && bStart.isBefore(aEnd);
    }
}
