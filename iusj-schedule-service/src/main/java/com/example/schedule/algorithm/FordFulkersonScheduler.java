package com.example.schedule.algorithm;

import java.util.*;

/**
 * Implémentation de l'algorithme Ford-Fulkerson pour l'attribution optimale des salles.
 * 
 * Le graphe modélise:
 * - Source → Créneaux de disponibilité des enseignants
 * - Créneaux → Salles disponibles
 * - Salles → Puits (Sink)
 * 
 * L'algorithme trouve le flux maximum pour maximiser le nombre de séances planifiées.
 */
public class FordFulkersonScheduler {

    /**
     * Structure représentant un créneau horaire à planifier
     */
    public static class TimeSlot {
        public Long teacherId;
        public Long matiereId;
        public Long groupId;
        public String date;        // YYYY-MM-DD
        public String startTime;   // HH:mm
        public String endTime;     // HH:mm
        public int requiredCapacity;
        
        public TimeSlot(Long teacherId, Long matiereId, Long groupId, 
                       String date, String startTime, String endTime, int requiredCapacity) {
            this.teacherId = teacherId;
            this.matiereId = matiereId;
            this.groupId = groupId;
            this.date = date;
            this.startTime = startTime;
            this.endTime = endTime;
            this.requiredCapacity = requiredCapacity;
        }
        
        public String getKey() {
            return teacherId + "_" + date + "_" + startTime;
        }
    }

    /**
     * Structure représentant une salle
     */
    public static class Room {
        public Long id;
        public String name;
        public int capacity;
        public String type;
        
        public Room(Long id, String name, int capacity, String type) {
            this.id = id;
            this.name = name;
            this.capacity = capacity;
            this.type = type;
        }
    }

    /**
     * Résultat de l'affectation d'un créneau à une salle
     */
    public static class Assignment {
        public TimeSlot slot;
        public Room room;
        
        public Assignment(TimeSlot slot, Room room) {
            this.slot = slot;
            this.room = room;
        }
    }

    // Graphe de flux: adjacencyList[u] = liste des (v, capacité)
    private Map<Integer, List<int[]>> graph;
    private int[] parent;
    private int numNodes;
    
    // Mapping des nœuds
    private static final int SOURCE = 0;
    private int sink;
    private Map<String, Integer> slotToNode;
    private Map<Long, Integer> roomToNode;
    private Map<Integer, TimeSlot> nodeToSlot;
    private Map<Integer, Room> nodeToRoom;

    /**
     * Exécute l'algorithme Ford-Fulkerson pour trouver l'attribution optimale.
     * 
     * @param slots Liste des créneaux à planifier (disponibilités enseignants)
     * @param rooms Liste des salles disponibles
     * @param roomAvailability Map: roomId -> Set de créneaux libres ("date_startTime")
     * @return Liste des affectations optimales
     */
    public List<Assignment> findOptimalAssignments(
            List<TimeSlot> slots, 
            List<Room> rooms,
            Map<Long, Set<String>> roomAvailability) {
        
        if (slots.isEmpty() || rooms.isEmpty()) {
            return Collections.emptyList();
        }

        // Initialiser les mappings
        initializeMappings(slots, rooms);
        
        // Construire le graphe
        buildGraph(slots, rooms, roomAvailability);
        
        // Exécuter Ford-Fulkerson
        int maxFlow = fordFulkerson();
        
        // Extraire les affectations du graphe résiduel
        return extractAssignments(slots, rooms);
    }

    private void initializeMappings(List<TimeSlot> slots, List<Room> rooms) {
        slotToNode = new HashMap<>();
        roomToNode = new HashMap<>();
        nodeToSlot = new HashMap<>();
        nodeToRoom = new HashMap<>();
        
        // Nœud 0 = source
        // Nœuds 1 à slots.size() = créneaux
        // Nœuds slots.size()+1 à slots.size()+rooms.size() = salles
        // Dernier nœud = sink
        
        int nodeId = 1;
        for (TimeSlot slot : slots) {
            slotToNode.put(slot.getKey(), nodeId);
            nodeToSlot.put(nodeId, slot);
            nodeId++;
        }
        
        for (Room room : rooms) {
            roomToNode.put(room.id, nodeId);
            nodeToRoom.put(nodeId, room);
            nodeId++;
        }
        
        sink = nodeId;
        numNodes = nodeId + 1;
    }

    private void buildGraph(List<TimeSlot> slots, List<Room> rooms, 
                           Map<Long, Set<String>> roomAvailability) {
        graph = new HashMap<>();
        
        for (int i = 0; i < numNodes; i++) {
            graph.put(i, new ArrayList<>());
        }
        
        // Arêtes Source → Créneaux (capacité 1 chacun)
        for (TimeSlot slot : slots) {
            int slotNode = slotToNode.get(slot.getKey());
            addEdge(SOURCE, slotNode, 1);
        }
        
        // Arêtes Créneaux → Salles (si compatible et disponible)
        for (TimeSlot slot : slots) {
            int slotNode = slotToNode.get(slot.getKey());
            String slotKey = slot.date + "_" + slot.startTime;
            
            for (Room room : rooms) {
                // Vérifier capacité
                if (room.capacity < slot.requiredCapacity) {
                    continue;
                }
                
                // Vérifier disponibilité de la salle
                Set<String> availability = roomAvailability.get(room.id);
                if (availability != null && availability.contains(slotKey)) {
                    int roomNode = roomToNode.get(room.id);
                    addEdge(slotNode, roomNode, 1);
                }
            }
        }
        
        // Arêtes Salles → Sink (capacité = nombre max de créneaux par jour pour cette salle)
        // Pour simplifier, on met une capacité élevée
        for (Room room : rooms) {
            int roomNode = roomToNode.get(room.id);
            addEdge(roomNode, sink, slots.size());
        }
    }

    private void addEdge(int u, int v, int capacity) {
        graph.get(u).add(new int[]{v, capacity});
        graph.get(v).add(new int[]{u, 0}); // Arête résiduelle
    }

    /**
     * Algorithme de Ford-Fulkerson avec BFS (Edmonds-Karp)
     */
    private int fordFulkerson() {
        int maxFlow = 0;
        parent = new int[numNodes];
        
        while (bfs()) {
            // Trouver le flux minimum sur le chemin
            int pathFlow = Integer.MAX_VALUE;
            for (int v = sink; v != SOURCE; v = parent[v]) {
                int u = parent[v];
                for (int[] edge : graph.get(u)) {
                    if (edge[0] == v) {
                        pathFlow = Math.min(pathFlow, edge[1]);
                        break;
                    }
                }
            }
            
            // Mettre à jour les capacités
            for (int v = sink; v != SOURCE; v = parent[v]) {
                int u = parent[v];
                
                // Diminuer capacité de l'arête directe
                for (int[] edge : graph.get(u)) {
                    if (edge[0] == v) {
                        edge[1] -= pathFlow;
                        break;
                    }
                }
                
                // Augmenter capacité de l'arête inverse
                for (int[] edge : graph.get(v)) {
                    if (edge[0] == u) {
                        edge[1] += pathFlow;
                        break;
                    }
                }
            }
            
            maxFlow += pathFlow;
        }
        
        return maxFlow;
    }

    /**
     * BFS pour trouver un chemin augmentant
     */
    private boolean bfs() {
        Arrays.fill(parent, -1);
        boolean[] visited = new boolean[numNodes];
        Queue<Integer> queue = new LinkedList<>();
        
        queue.add(SOURCE);
        visited[SOURCE] = true;
        
        while (!queue.isEmpty()) {
            int u = queue.poll();
            
            for (int[] edge : graph.get(u)) {
                int v = edge[0];
                int capacity = edge[1];
                
                if (!visited[v] && capacity > 0) {
                    visited[v] = true;
                    parent[v] = u;
                    
                    if (v == sink) {
                        return true;
                    }
                    
                    queue.add(v);
                }
            }
        }
        
        return false;
    }

    /**
     * Extrait les affectations à partir du graphe résiduel
     */
    private List<Assignment> extractAssignments(List<TimeSlot> slots, List<Room> rooms) {
        List<Assignment> assignments = new ArrayList<>();
        
        for (TimeSlot slot : slots) {
            int slotNode = slotToNode.get(slot.getKey());
            
            // Chercher une arête saturée (capacité = 0) vers une salle
            for (int[] edge : graph.get(slotNode)) {
                int roomNode = edge[0];
                Room room = nodeToRoom.get(roomNode);
                
                if (room != null) {
                    // Vérifier si l'arête inverse a capacité > 0 (flux passé)
                    for (int[] reverseEdge : graph.get(roomNode)) {
                        if (reverseEdge[0] == slotNode && reverseEdge[1] > 0) {
                            assignments.add(new Assignment(slot, room));
                            break;
                        }
                    }
                }
            }
        }
        
        return assignments;
    }
}
