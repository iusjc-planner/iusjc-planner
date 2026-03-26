package com.example.iusj_schedule_service.algorithm;

import com.example.iusj_schedule_service.dto.GenerationCourseInput;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class FlowNetworkBuilder {

    public BuiltNetwork build(
            List<GenerationCourseInput> courses,
            List<TimeSlot> slots,
            List<Long> roomPool,
            ScheduleConstraint constraint
    ) {
        int source = 0;
        int nodeCursor = 1;

        List<FlowVertex> vertices = new ArrayList<>();
        vertices.add(new FlowVertex(source, FlowVertex.VertexType.SOURCE, "SOURCE"));

        List<FlowEdge> edges = new ArrayList<>();
        Map<Integer, GenerationCourseInput> courseNodeMap = new HashMap<>();
        Map<Integer, AssignmentCandidate> assignmentNodeMap = new HashMap<>();
        Map<Integer, List<FlowEdge>> adjacency = new HashMap<>();

        for (int i = 0; i < courses.size(); i++) {
            int courseNode = nodeCursor++;
            GenerationCourseInput course = courses.get(i);
            vertices.add(new FlowVertex(courseNode, FlowVertex.VertexType.COURSE, "COURSE-" + i));
            courseNodeMap.put(courseNode, course);
            addEdge(edges, adjacency, source, courseNode, 1);
        }

        Map<String, Integer> assignmentNodeIds = new HashMap<>();

        for (Map.Entry<Integer, GenerationCourseInput> entry : courseNodeMap.entrySet()) {
            int courseNode = entry.getKey();
            GenerationCourseInput course = entry.getValue();

            for (int slotIndex = 0; slotIndex < slots.size(); slotIndex++) {
                TimeSlot slot = slots.get(slotIndex);
                for (Long roomId : roomPool) {
                    List<String> errors = constraint.validate(course, slot, roomId, List.of());
                    if (!errors.isEmpty()) {
                        continue;
                    }

                    String assignmentKey = slotIndex + "#" + roomId;
                    Integer assignmentNode = assignmentNodeIds.get(assignmentKey);
                    if (assignmentNode == null) {
                        assignmentNode = nodeCursor++;
                        assignmentNodeIds.put(assignmentKey, assignmentNode);
                        vertices.add(new FlowVertex(assignmentNode, FlowVertex.VertexType.ASSIGNMENT, assignmentKey));
                        assignmentNodeMap.put(assignmentNode, new AssignmentCandidate(slotIndex, roomId));
                    }

                    addEdge(edges, adjacency, courseNode, assignmentNode, 1);
                }
            }
        }

        int sink = nodeCursor;
        vertices.add(new FlowVertex(sink, FlowVertex.VertexType.SINK, "SINK"));

        for (Integer assignmentNode : assignmentNodeMap.keySet()) {
            addEdge(edges, adjacency, assignmentNode, sink, 1);
        }

        BuiltNetwork network = new BuiltNetwork();
        network.setSource(source);
        network.setSink(sink);
        network.setVertices(vertices);
        network.setEdges(edges);
        network.setAdjacency(adjacency);
        network.setCourseNodeMap(courseNodeMap);
        network.setAssignmentNodeMap(assignmentNodeMap);
        return network;
    }

    private void addEdge(List<FlowEdge> edges, Map<Integer, List<FlowEdge>> adjacency, int from, int to, int capacity) {
        FlowEdge edge = new FlowEdge(from, to, capacity);
        edges.add(edge);
        adjacency.computeIfAbsent(from, k -> new ArrayList<>()).add(edge);
        adjacency.computeIfAbsent(to, k -> new ArrayList<>()).add(edge);
    }

    public static class BuiltNetwork {
        private int source;
        private int sink;
        private List<FlowVertex> vertices;
        private List<FlowEdge> edges;
        private Map<Integer, List<FlowEdge>> adjacency;
        private Map<Integer, GenerationCourseInput> courseNodeMap;
        private Map<Integer, AssignmentCandidate> assignmentNodeMap;

        public int getSource() {
            return source;
        }

        public void setSource(int source) {
            this.source = source;
        }

        public int getSink() {
            return sink;
        }

        public void setSink(int sink) {
            this.sink = sink;
        }

        public List<FlowVertex> getVertices() {
            return vertices;
        }

        public void setVertices(List<FlowVertex> vertices) {
            this.vertices = vertices;
        }

        public List<FlowEdge> getEdges() {
            return edges;
        }

        public void setEdges(List<FlowEdge> edges) {
            this.edges = edges;
        }

        public Map<Integer, List<FlowEdge>> getAdjacency() {
            return adjacency;
        }

        public void setAdjacency(Map<Integer, List<FlowEdge>> adjacency) {
            this.adjacency = adjacency;
        }

        public Map<Integer, GenerationCourseInput> getCourseNodeMap() {
            return courseNodeMap;
        }

        public void setCourseNodeMap(Map<Integer, GenerationCourseInput> courseNodeMap) {
            this.courseNodeMap = courseNodeMap;
        }

        public Map<Integer, AssignmentCandidate> getAssignmentNodeMap() {
            return assignmentNodeMap;
        }

        public void setAssignmentNodeMap(Map<Integer, AssignmentCandidate> assignmentNodeMap) {
            this.assignmentNodeMap = assignmentNodeMap;
        }
    }

    public static class AssignmentCandidate {
        private final int slotIndex;
        private final Long roomId;

        public AssignmentCandidate(int slotIndex, Long roomId) {
            this.slotIndex = slotIndex;
            this.roomId = roomId;
        }

        public int getSlotIndex() {
            return slotIndex;
        }

        public Long getRoomId() {
            return roomId;
        }
    }
}
