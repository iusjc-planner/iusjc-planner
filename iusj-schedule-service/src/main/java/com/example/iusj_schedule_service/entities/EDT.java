package com.example.iusj_schedule_service.entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "edts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EDT {

    public enum PeriodeType {
        SEMESTRE1,
        SEMESTRE2,
        ANNUEL
    }

    public enum VueType {
        GROUPE,
        ENSEIGNANT,
        SALLE
    }

    public enum EDTStatus {
        DRAFT,
        VALIDATED,
        PUBLISHED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Min(1)
    @Max(53)
    private Integer semaine;

    @NotNull
    @Min(2000)
    @Max(2100)
    private Integer annee;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private PeriodeType periode;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private VueType vue;

    @NotNull
    private Long targetId;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private EDTStatus status;

    private Long creePar;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateCreation;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime datePublication;

    @OneToMany(mappedBy = "edt", cascade = CascadeType.ALL, orphanRemoval = false)
    @JsonManagedReference
    private List<ScheduleEntry> entries = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (dateCreation == null) {
            dateCreation = LocalDateTime.now();
        }
        if (status == null) {
            status = EDTStatus.DRAFT;
        }
        if (periode == null) {
            periode = PeriodeType.ANNUEL;
        }
    }
}
