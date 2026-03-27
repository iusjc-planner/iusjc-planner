package com.example.iusj_schedule_service.algorithm;

public class FlowEdge {

    private final int from;
    private final int to;
    private final int capacity;
    private int flow;

    public FlowEdge(int from, int to, int capacity) {
        this.from = from;
        this.to = to;
        this.capacity = capacity;
        this.flow = 0;
    }

    public int getFrom() {
        return from;
    }

    public int getTo() {
        return to;
    }

    public int getCapacity() {
        return capacity;
    }

    public int getFlow() {
        return flow;
    }

    public void addFlow(int amount) {
        this.flow += amount;
    }

    public void reduceFlow(int amount) {
        this.flow -= amount;
    }

    public int residualForward() {
        return capacity - flow;
    }

    public int residualBackward() {
        return flow;
    }
}
