package com.example.iusj_resource_service.entities;

import jakarta.persistence.Column;
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
@Table(name = "resources", uniqueConstraints = {
        @UniqueConstraint(name = "uk_resource_name", columnNames = "name")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Resource {

    public enum Status {
        ACTIVE,
        INACTIVE,
        MAINTENANCE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 150)
    private String name;

    @NotBlank
    @Size(max = 100)
    private String type;

    @NotNull
    @Min(0)
    @Column(name = "quantity_total")
    private Integer quantityTotal;

    @NotNull
    @Min(0)
    @Column(name = "quantity_available")
    private Integer quantityAvailable;

    @Size(max = 255)
    private String location;

    @Size(max = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Status status = Status.ACTIVE;
}
