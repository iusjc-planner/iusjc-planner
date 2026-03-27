package com.example.iusj_schedule_service.algorithm;

import com.example.iusj_schedule_service.dto.GenerationCourseInput;
import com.example.iusj_schedule_service.entities.ScheduleEntry;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.Set;

public class FordFulkersonScheduler implements ScheduleAlgorithm {

    private final FlowNetworkBuilder flowNetworkBuilder = new FlowNetworkBuilder();

    @Override
    public GreedyScheduler.PlacementResult place(
            List<GenerationCourseInput> courses,
            List<TimeSlot> slots,
            List<Long> roomPool,
            ScheduleConstraint constraint
    ) {
        FlowNetworkBuilder.BuiltNetwork network = flowNetworkBuilder.build(courses, slots, roomPool, constraint);
        maxFlow(network);

        List<GreedyScheduler.PlacedCandidate> tentative = extractTentativePlacements(network, slots);
        return enforceHardConflicts(tentative, courses, constraint);
    }

    private int maxFlow(FlowNetworkBuilder.BuiltNetwork network) {
        int source = network.getSource();
        int sink = network.getSink();
        int totalFlow = 0;

        while (true) {
            Map<Integer, ParentArc> parent = bfsAugmentingPath(network, source, sink);
            if (!parent.containsKey(sink)) {
                break;
            }

            int bottleneck = Integer.MAX_VALUE;
            int node = sink;
            while (node != source) {
                ParentArc arc = parent.get(node);
                int residual = arc.forward ? arc.edge.residualForward() : arc.edge.residualBackward();
                bottleneck = Math.min(bottleneck, residual);
                node = arc.previous;
            }

            node = sink;
            while (node != source) {
                ParentArc arc = parent.get(node);
                if (arc.forward) {
                    arc.edge.addFlow(bottleneck);
                } else {
                    arc.edge.reduceFlow(bottleneck);
                }
                node = arc.previous;
            }

            totalFlow += bottleneck;
        }

        return totalFlow;
    }

    private Map<Integer, ParentArc> bfsAugmentingPath(FlowNetworkBuilder.BuiltNetwork network, int source, int sink) {
        Map<Integer, ParentArc> parent = new HashMap<>();
        Queue<Integer> queue = new ArrayDeque<>();
        Set<Integer> visited = new HashSet<>();

        queue.add(source);
        visited.add(source);

        while (!queue.isEmpty()) {
            int current = queue.poll();
            if (current == sink) {
                break;
            }

            for (FlowEdge edge : network.getAdjacency().getOrDefault(current, List.of())) {
                if (edge.getFrom() == current && edge.residualForward() > 0 && !visited.contains(edge.getTo())) {
                    visited.add(edge.getTo());
                    parent.put(edge.getTo(), new ParentArc(current, edge, true));
                    queue.add(edge.getTo());
                }

                if (edge.getTo() == current && edge.residualBackward() > 0 && !visited.contains(edge.getFrom())) {
                    visited.add(edge.getFrom());
                    parent.put(edge.getFrom(), new ParentArc(current, edge, false));
                    queue.add(edge.getFrom());
                }
            }
        }

        return parent;
    }

    private List<GreedyScheduler.PlacedCandidate> extractTentativePlacements(
            FlowNetworkBuilder.BuiltNetwork network,
            List<TimeSlot> slots
    ) {
        List<GreedyScheduler.PlacedCandidate> placed = new ArrayList<>();

        for (FlowEdge edge : network.getEdges()) {
            if (edge.getFlow() <= 0) {
                continue;
            }

            GenerationCourseInput course = network.getCourseNodeMap().get(edge.getFrom());
            FlowNetworkBuilder.AssignmentCandidate assignment = network.getAssignmentNodeMap().get(edge.getTo());
            if (course == null || assignment == null) {
                continue;
            }

            TimeSlot slot = slots.get(assignment.getSlotIndex());
            placed.add(new GreedyScheduler.PlacedCandidate(course, slot, assignment.getRoomId()));
        }

        return placed;
    }

    private GreedyScheduler.PlacementResult enforceHardConflicts(
            List<GreedyScheduler.PlacedCandidate> tentative,
            List<GenerationCourseInput> allCourses,
            ScheduleConstraint constraint
    ) {
        List<GreedyScheduler.PlacedCandidate> accepted = new ArrayList<>();
        List<GenerationCourseInput> unplaced = new ArrayList<>();
        List<String> conflicts = new ArrayList<>();

        for (GreedyScheduler.PlacedCandidate candidate : tentative.stream()
                .sorted((a, b) -> a.getSlot().getStart().compareTo(b.getSlot().getStart()))
                .toList()) {

            List<ScheduleEntry> alreadyPlaced = new ArrayList<>();
            for (GreedyScheduler.PlacedCandidate acceptedCandidate : accepted) {
                ScheduleEntry entry = new ScheduleEntry();
                entry.setCourseId(acceptedCandidate.getCourse().getCourseId());
                entry.setTeacherId(acceptedCandidate.getCourse().getTeacherId());
                entry.setGroupId(acceptedCandidate.getCourse().getGroupId());
                entry.setRoomId(acceptedCandidate.getRoomId());
                entry.setStartTime(acceptedCandidate.getSlot().getStart());
                entry.setEndTime(acceptedCandidate.getSlot().getEnd());
                alreadyPlaced.add(entry);
            }

            List<String> errors = constraint.validate(candidate.getCourse(), candidate.getSlot(), candidate.getRoomId(), alreadyPlaced);
            if (errors.isEmpty()) {
                accepted.add(candidate);
            } else {
                unplaced.add(candidate.getCourse());
                conflicts.addAll(errors);
            }
        }

        Set<Long> acceptedCourseIds = new HashSet<>();
        for (GreedyScheduler.PlacedCandidate acceptedCandidate : accepted) {
            if (acceptedCandidate.getCourse().getId() != null) {
                acceptedCourseIds.add(acceptedCandidate.getCourse().getId());
            }
        }

        for (GenerationCourseInput course : allCourses) {
            Long id = course.getId();
            if (id == null || !acceptedCourseIds.contains(id)) {
                boolean alreadyInUnplaced = unplaced.stream().anyMatch(u -> u.getId() != null && u.getId().equals(id));
                if (!alreadyInUnplaced) {
                    unplaced.add(course);
                }
            }
        }

        GreedyScheduler.PlacementResult result = new GreedyScheduler.PlacementResult();
        result.setPlaced(accepted);
        result.setUnplaced(unplaced);
        result.setConflicts(conflicts);
        return result;
    }

    private static class ParentArc {
        private final int previous;
        private final FlowEdge edge;
        private final boolean forward;

        private ParentArc(int previous, FlowEdge edge, boolean forward) {
            this.previous = previous;
            this.edge = edge;
            this.forward = forward;
        }
    }
}
