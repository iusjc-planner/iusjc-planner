package com.example.iusj_course_service.entities;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "courses", uniqueConstraints = {
        @UniqueConstraint(name = "uk_course_code", columnNames = "code")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Course {

    public enum CourseStatus {
        ACTIVE,
        INACTIVE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 50)
    private String code;

    @NotBlank
    @Size(max = 150)
    private String title;

    @Size(max = 500)
    private String description;

    @NotNull
    private Integer credits;

    private Integer hoursPerWeek;

    private Long teacherId;

    private Long roomId;

    @Enumerated(EnumType.STRING)
    private CourseStatus status = CourseStatus.ACTIVE;

    private LocalDate startDate;
    private LocalDate endDate;
}
