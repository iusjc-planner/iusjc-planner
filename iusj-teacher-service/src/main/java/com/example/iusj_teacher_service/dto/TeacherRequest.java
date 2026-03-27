package com.example.iusj_teacher_service.dto;

import java.util.HashSet;
import java.util.Set;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TeacherRequest {

    @NotNull
    private Long userId;

    private Set<String> specialities = new HashSet<>();
}
