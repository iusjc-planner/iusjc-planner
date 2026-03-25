package com.example.iusj_course_service.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "supports")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Support {

    public enum SupportType {
        PDF,
        VIDEO,
        LIEN,
        DOCUMENT,
        IMAGE,
        AUTRE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 200)
    @Column(nullable = false, length = 200)
    private String titre;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SupportType type;

    @NotBlank
    @Size(max = 500)
    @Column(nullable = false, length = 500)
    private String url;

    private Long taille;

    @NotNull
    @Column(nullable = false)
    private Long matiereId;

    private Long uploadePar;

    @Column(nullable = false)
    private LocalDateTime dateAjout;

    @Size(max = 1000)
    @Column(length = 1000)
    private String description;

    @ManyToOne
    @JoinColumn(name = "matiere_id", referencedColumnName = "id", insertable = false, updatable = false)
    @JsonBackReference
    private Matiere matiere;

    @PrePersist
    public void prePersist() {
        if (dateAjout == null) {
            dateAjout = LocalDateTime.now();
        }
    }
}
