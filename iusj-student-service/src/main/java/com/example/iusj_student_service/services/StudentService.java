package com.example.iusj_student_service.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.iusj_student_service.dto.StudentRequest;
import com.example.iusj_student_service.dto.StudentResponse;
import com.example.iusj_student_service.entities.Student;
import com.example.iusj_student_service.entities.StudentGroup;
import com.example.iusj_student_service.repositories.StudentRepository;

@Service
@Transactional
public class StudentService {

    private final StudentRepository repository;

    public StudentService(StudentRepository repository) {
        this.repository = repository;
    }

    public List<StudentResponse> getAll(String matricule, String nom, String prenom,
                                        String email, Student.Status status, Long groupId) {
        Specification<Student> spec = StudentSpecifications.withFilters(matricule, nom, prenom, email, status, groupId);
        return repository.findAll(spec, Sort.by(Sort.Direction.ASC, "nom", "prenom"))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public Optional<StudentResponse> getById(Long id) {
        return repository.findById(id).map(this::toResponse);
    }

    public StudentResponse create(StudentRequest request) {
        Student student = new Student();
        applyRequest(student, request);
        return toResponse(repository.save(student));
    }

    public Optional<StudentResponse> update(Long id, StudentRequest request) {
        return repository.findById(id).map(existing -> {
            applyRequest(existing, request);
            return toResponse(repository.save(existing));
        });
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public Optional<StudentResponse> addGroup(Long studentId, Long groupId) {
        return repository.findById(studentId).map(student -> {
            boolean exists = student.getGroups().stream()
                    .anyMatch(group -> groupId.equals(group.getGroupId()));
            if (!exists) {
                student.getGroups().add(new StudentGroup(null, student, groupId));
            }
            return toResponse(repository.save(student));
        });
    }

    public Optional<StudentResponse> removeGroup(Long studentId, Long groupId) {
        return repository.findById(studentId).map(student -> {
            student.getGroups().removeIf(group -> groupId.equals(group.getGroupId()));
            return toResponse(repository.save(student));
        });
    }

    private void applyRequest(Student student, StudentRequest request) {
        student.setMatricule(request.getMatricule());
        student.setNom(request.getNom());
        student.setPrenom(request.getPrenom());
        student.setDateNaissance(request.getDateNaissance());
        student.setEmail(request.getEmail());
        student.setStatus(request.getStatus());
        syncGroups(student, request.getGroupIds());
    }

    private void syncGroups(Student student, List<Long> groupIds) {
        List<Long> ids = groupIds == null ? List.of() : groupIds;
        student.getGroups().removeIf(group -> !ids.contains(group.getGroupId()));
        for (Long groupId : ids) {
            boolean exists = student.getGroups().stream()
                    .anyMatch(group -> groupId.equals(group.getGroupId()));
            if (!exists) {
                student.getGroups().add(new StudentGroup(null, student, groupId));
            }
        }
    }

    private StudentResponse toResponse(Student student) {
        List<Long> groupIds = new ArrayList<>();
        for (StudentGroup group : student.getGroups()) {
            groupIds.add(group.getGroupId());
        }
        return new StudentResponse(
                student.getId(),
                student.getMatricule(),
                student.getNom(),
                student.getPrenom(),
                student.getDateNaissance(),
                student.getEmail(),
                student.getStatus(),
                groupIds
        );
    }
}
