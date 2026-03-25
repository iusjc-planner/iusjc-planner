package com.example.iusj_room_service.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "room_equipments", uniqueConstraints = {
    @UniqueConstraint(name = "uk_room_equipment_room_resource", columnNames = {"room_id", "resource_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomEquipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @NotNull
    @Column(name = "resource_id", nullable = false)
    private Long resourceId;

    @NotNull
    @Min(1)
    @Column(nullable = false)
    private Integer quantite = 1;

    @ManyToOne
    @JoinColumn(name = "room_id", insertable = false, updatable = false)
    @JsonBackReference
    private Room room;
}
