package com.example.iusj_resource_service.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "ressources")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Resource {

    public enum TypeRessource {
        PROJECTEUR, ORDINATEUR, MATERIEL, AUTRE
    }

    public enum StatutRessource {
        DISPONIBLE, RESERVE, MAINTENANCE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 255)
    private String nom;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private TypeRessource type;

    @NotNull
    @Min(1)
    private Integer quantite;

    @Size(max = 255)
    private String localisation;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private StatutRessource statut = StatutRessource.DISPONIBLE;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (statut == null) statut = StatutRessource.DISPONIBLE;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
