package com.example.iusj_student_service.dto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.example.iusj_student_service.entities.Student;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StudentResponse {

    private Long id;
    private String matricule;
    private String nom;
    private String prenom;
    private LocalDate dateNaissance;
    private String email;
    private Student.Status status;
    private List<Long> groupIds = new ArrayList<>();
}
