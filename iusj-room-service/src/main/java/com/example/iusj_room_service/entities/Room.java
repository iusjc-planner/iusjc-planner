package com.example.iusj_room_service.entities;

import java.util.List;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "rooms", uniqueConstraints = {
        @UniqueConstraint(name = "uk_room_name", columnNames = "name")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    public enum RoomType {
        CLASSROOM,
        LAB,
        AUDITORIUM
    }

    public enum RoomStatus {
        ACTIVE,
        MAINTENANCE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 120)
    private String name;

    @NotNull
    @Min(1)
    private Integer capacity;

    @Enumerated(EnumType.STRING)
    private RoomType type = RoomType.CLASSROOM;

    @Enumerated(EnumType.STRING)
    private RoomStatus status = RoomStatus.ACTIVE;

    @Size(max = 255)
    private String location;

    @Size(max = 255)
    private String description;

    @ElementCollection
    private List<String> equipments;
}
