package com.example.iusj_schedule_service.algorithm;

public class FlowVertex {

    public enum VertexType {
        SOURCE,
        COURSE,
        ASSIGNMENT,
        SINK
    }

    private final int id;
    private final VertexType type;
    private final String key;

    public FlowVertex(int id, VertexType type, String key) {
        this.id = id;
        this.type = type;
        this.key = key;
    }

    public int getId() {
        return id;
    }

    public VertexType getType() {
        return type;
    }

    public String getKey() {
        return key;
    }
}
