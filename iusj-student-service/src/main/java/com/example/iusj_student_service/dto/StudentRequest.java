package com.example.iusj_student_service.dto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.example.iusj_student_service.entities.Student;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class StudentRequest {

    @NotBlank
    @Size(max = 50)
    private String matricule;

    @NotBlank
    @Size(max = 100)
    private String nom;

    @NotBlank
    @Size(max = 100)
    private String prenom;

    @NotNull
    private LocalDate dateNaissance;

    @NotBlank
    @Email
    @Size(max = 150)
    private String email;

    @NotNull
    private Student.Status status = Student.Status.ACTIVE;

    private List<Long> groupIds = new ArrayList<>();
}
