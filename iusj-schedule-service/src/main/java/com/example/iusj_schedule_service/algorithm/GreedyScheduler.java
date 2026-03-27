package com.example.iusj_schedule_service.algorithm;

import com.example.iusj_schedule_service.dto.GenerationCourseInput;

import java.util.ArrayList;
import java.util.List;

public class GreedyScheduler implements ScheduleAlgorithm {

    @Override
    public PlacementResult place(
            List<GenerationCourseInput> courses,
            List<TimeSlot> slots,
        List<Long> roomPool,
            ScheduleConstraint constraint
    ) {
        List<PlacedCandidate> placed = new ArrayList<>();
        List<GenerationCourseInput> unplaced = new ArrayList<>();
        List<String> conflicts = new ArrayList<>();

        for (GenerationCourseInput course : courses) {
            boolean done = false;
            for (TimeSlot slot : slots) {
                List<Long> candidates = roomPool == null || roomPool.isEmpty() ? List.of(1L) : roomPool;
                for (Long roomId : candidates) {
                    if (course.getPreferredRoomId() != null && !course.getPreferredRoomId().equals(roomId)) {
                        continue;
                    }

                    List<String> errors = constraint.validate(course, slot, roomId, toPlacedEntries(placed));
                    if (errors.isEmpty()) {
                        placed.add(new PlacedCandidate(course, slot, roomId));
                        done = true;
                        break;
                    }
                    conflicts.addAll(errors);
                }
                if (done) {
                    break;
                }
            }
            if (!done) {
                unplaced.add(course);
            }
        }

        PlacementResult result = new PlacementResult();
        result.setPlaced(placed);
        result.setUnplaced(unplaced);
        result.setConflicts(conflicts);
        return result;
    }

    private List<com.example.iusj_schedule_service.entities.ScheduleEntry> toPlacedEntries(List<PlacedCandidate> placed) {
        List<com.example.iusj_schedule_service.entities.ScheduleEntry> entries = new ArrayList<>();
        for (PlacedCandidate candidate : placed) {
            com.example.iusj_schedule_service.entities.ScheduleEntry entry = new com.example.iusj_schedule_service.entities.ScheduleEntry();
            entry.setCourseId(candidate.getCourse().getCourseId());
            entry.setTeacherId(candidate.getCourse().getTeacherId());
            entry.setGroupId(candidate.getCourse().getGroupId());
            entry.setRoomId(candidate.getRoomId());
            entry.setStartTime(candidate.getSlot().getStart());
            entry.setEndTime(candidate.getSlot().getEnd());
            entries.add(entry);
        }
        return entries;
    }

    public static class PlacementResult {
        private List<PlacedCandidate> placed = new ArrayList<>();
        private List<GenerationCourseInput> unplaced = new ArrayList<>();
        private List<String> conflicts = new ArrayList<>();

        public List<PlacedCandidate> getPlaced() {
            return placed;
        }

        public void setPlaced(List<PlacedCandidate> placed) {
            this.placed = placed;
        }

        public List<GenerationCourseInput> getUnplaced() {
            return unplaced;
        }

        public void setUnplaced(List<GenerationCourseInput> unplaced) {
            this.unplaced = unplaced;
        }

        public List<String> getConflicts() {
            return conflicts;
        }

        public void setConflicts(List<String> conflicts) {
            this.conflicts = conflicts;
        }
    }

    public static class PlacedCandidate {
        private final GenerationCourseInput course;
        private final TimeSlot slot;
        private final Long roomId;

        public PlacedCandidate(GenerationCourseInput course, TimeSlot slot, Long roomId) {
            this.course = course;
            this.slot = slot;
            this.roomId = roomId;
        }

        public GenerationCourseInput getCourse() {
            return course;
        }

        public TimeSlot getSlot() {
            return slot;
        }

        public Long getRoomId() {
            return roomId;
        }
    }
}
