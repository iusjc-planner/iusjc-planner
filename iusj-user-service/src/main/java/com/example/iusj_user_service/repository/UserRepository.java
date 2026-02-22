package com.example.iusj_user_service.repository;

import com.example.iusj_user_service.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);
    boolean existsByLogin(String login);
    Optional<User> findByLogin(String login);
    List<User> findByRole(User.Role role);
}
