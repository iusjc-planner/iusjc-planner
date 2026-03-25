package com.example.iusj_group_service.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "`groups`", uniqueConstraints = {
        @UniqueConstraint(name = "uk_group_name", columnNames = "name")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Group {

    public enum Status { ACTIVE, INACTIVE }

    public enum GroupType { PRINCIPAL, TD, TP, AUTRE }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 100)
    private String name;

    @Size(max = 50)
    private String level;

    private Long schoolId;

    @NotNull
    private Long filiereId;

    private Integer size;

    @Column(name = "parent_group_id")
    private Long parentGroupId;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private GroupType groupType = GroupType.PRINCIPAL;

    @ManyToOne
    @JoinColumn(name = "parent_group_id", insertable = false, updatable = false)
    @JsonBackReference
    private Group parentGroup;

    @OneToMany(mappedBy = "parentGroup")
    @JsonManagedReference
    private List<Group> subGroups = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    private Status status = Status.ACTIVE;
}
