package com.example.iusj_school_service.entities;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "schools", uniqueConstraints = {
        @UniqueConstraint(name = "uk_school_name", columnNames = "name")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class School {

    public enum Status { ACTIVE, INACTIVE }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 150)
    private String name;

    @Size(max = 20)
    private String code;

    @Size(max = 500)
    private String description;

    @Size(max = 250)
    private String address;

    @Size(max = 50)
    private String phone;

    @Email
    @Size(max = 120)
    private String email;

    @Enumerated(EnumType.STRING)
    private Status status = Status.ACTIVE;

    @OneToMany(mappedBy = "school", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Filiere> filieres = new ArrayList<>();

    // Helper method to add a filiere
    public void addFiliere(Filiere filiere) {
        filieres.add(filiere);
        filiere.setSchool(this);
    }

    // Helper method to remove a filiere
    public void removeFiliere(Filiere filiere) {
        filieres.remove(filiere);
        filiere.setSchool(null);
    }
}
