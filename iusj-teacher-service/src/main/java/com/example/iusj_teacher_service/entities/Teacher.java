package com.example.iusj_teacher_service.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Représente un enseignant du système.
 * 
 * Un enseignant est lié à un User (qui contient nom, prenom, email, telephone).
 * Un enseignant a des spécialités (matières qu'il enseigne) et des disponibilités.
 */
@Entity
@Table(name = "teachers", uniqueConstraints = {
        @UniqueConstraint(name = "uk_teacher_user_id", columnNames = "user_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Teacher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Référence au User (contient nom, prenom, email, telephone, status, role)
     */
    @NotNull
    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    /**
     * Matières que l'enseignant dispense
     * Exemple: ["Mathématiques", "Physique"]
     */
    @ElementCollection
    @CollectionTable(name = "teacher_specialities", 
                     joinColumns = @JoinColumn(name = "teacher_id"))
    @Column(name = "speciality")
    private Set<String> specialities = new HashSet<>();

    /**
     * Créneaux de disponibilité de l'enseignant
     */
    @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Disponibilite> disponibilites = new ArrayList<>();
}
