package com.example.iusj_report_service.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Rapport {

    public enum ReportType {
        OCCUPATION_SALLE,
        CHARGE_ENSEIGNANT,
        STATISTIQUES_ECOLE,
        EVENEMENTS,
        GLOBAL
    }

    public enum ReportFormat {
        PDF,
        EXCEL,
        JSON
    }

    public enum ReportStatus {
        EN_COURS,
        TERMINE,
        ERREUR
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false)
    private String titre;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 64)
    private ReportType type;

    @NotNull
    @Column(nullable = false)
    private LocalDateTime dateGeneration;

    private LocalDate periodeDebut;

    private LocalDate periodeFin;

    @NotNull
    @Column(nullable = false)
    private Long generePar;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private ReportFormat format;

    @Size(max = 500)
    private String cheminFichier;

    @Column(columnDefinition = "TEXT")
    private String parametres;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ReportStatus status;

    @PrePersist
    public void prePersist() {
        if (dateGeneration == null) {
            dateGeneration = LocalDateTime.now();
        }
        if (status == null) {
            status = ReportStatus.EN_COURS;
        }
    }
}
