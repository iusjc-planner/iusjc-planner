package com.example.iusj_course_service.entities;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Matière (Subject) - représente une matière enseignée
 * Le code de la matière sert d'identifiant unique (e.g., ISI4177)
 */
@Entity
@Table(name = "matieres", uniqueConstraints = {
        @UniqueConstraint(name = "uk_matiere_code", columnNames = "code")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Matiere {

    public enum MatiereStatus {
        ACTIVE,
        INACTIVE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Code unique de la matière (ex: ISI4177, GL3001)
     * Sert d'identifiant métier
     */
    @NotBlank
    @Size(max = 20)
    @Column(unique = true)
    private String code;

    /**
     * Nom complet de la matière
     */
    @NotBlank
    @Size(max = 200)
    private String nom;

    @Size(max = 1000)
    private String description;

    /**
     * ID de l'école
     */
    @NotNull
    private Long schoolId;

    /**
     * ID de la filière
     */
    @NotNull
    private Long filiereId;

    /**
     * ID de l'enseignant responsable
     */
    private Long teacherId;

    /**
     * Nombre de crédits (toujours positif)
     */
    @NotNull
    @Min(1)
    private Integer credits;

    /**
     * Volume horaire total (anciennement hoursPerWeek)
     */
    @NotNull
    @Min(1)
    private Integer hoursTotal;

    @Enumerated(EnumType.STRING)
    private MatiereStatus status = MatiereStatus.ACTIVE;

    /**
     * Liste des URLs/chemins vers les supports de cours
     * (PDF, DOCX, PPTX, etc.)
     */
    @ElementCollection
    @CollectionTable(name = "matiere_supports", joinColumns = @JoinColumn(name = "matiere_id"))
    @Column(name = "support_url")
    private List<String> supports = new ArrayList<>();
}
