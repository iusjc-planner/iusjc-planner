package com.example.iusj_auth_service.repository;

import com.example.iusj_auth_service.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);
    Optional<User> findByLogin(String login);

}

