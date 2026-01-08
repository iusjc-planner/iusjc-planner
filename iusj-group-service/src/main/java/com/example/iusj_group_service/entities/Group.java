package com.example.iusj_group_service.entities;

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
@Table(name = "groups", uniqueConstraints = {
        @UniqueConstraint(name = "uk_group_name", columnNames = "name")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Group {

    public enum Status { ACTIVE, INACTIVE }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 100)
    private String name;

    @Size(max = 50)
    private String level;

    @NotNull
    private Long schoolId;

    private Integer size;

    @Enumerated(EnumType.STRING)
    private Status status = Status.ACTIVE;
}
