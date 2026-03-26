package com.example.iusj_user_service.services;

import com.example.iusj_user_service.client.TeacherServiceClient;
import com.example.iusj_user_service.annotation.Audited;
import com.example.iusj_user_service.entities.AuditLog;
import com.example.iusj_user_service.entities.User;
import com.example.iusj_user_service.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TeacherServiceClient teacherServiceClient;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, TeacherServiceClient teacherServiceClient) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.teacherServiceClient = teacherServiceClient;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Audited(action = AuditLog.AuditAction.CREATE, entityType = "User")
    public User createUser(User user) {
        try {
            logger.info("Création utilisateur: nom={}, prenom={}, email={}, role={}", 
                user.getNom(), user.getPrenom(), user.getEmail(), user.getRole());
            
            // Encoder le mot de passe avant de sauvegarder
            if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                // Vérifier si le mot de passe n'est pas déjà encodé (BCrypt commence par $2a$, $2b$, ou $2y$)
                if (!user.getPassword().startsWith("$2a$") && 
                    !user.getPassword().startsWith("$2b$") && 
                    !user.getPassword().startsWith("$2y$")) {
                    user.setPassword(passwordEncoder.encode(user.getPassword()));
                }
            }
            
            User savedUser = userRepository.save(user);
            logger.info("Utilisateur créé avec ID: {}", savedUser.getId());
            
            // Si le rôle est ENSEIGNANT, créer automatiquement un Teacher
            if (savedUser.getRole() == User.Role.ENSEIGNANT) {
                logger.info("Création du teacher pour l'utilisateur: {}", savedUser.getId());
                teacherServiceClient.createTeacher(
                    savedUser.getId(),
                    savedUser.getNom(),
                    savedUser.getPrenom(),
                    savedUser.getEmail(),
                    savedUser.getTelephone() != null ? savedUser.getTelephone().toString() : null
                );
            }
            
            return savedUser;
        } catch (Exception e) {
            logger.error("Erreur lors de la création de l'utilisateur: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Audited(action = AuditLog.AuditAction.UPDATE, entityType = "User")
    public Optional<User> updateUser(Long id, User updatedUser) {
        return userRepository.findById(id).map(user -> {
            user.setNom(updatedUser.getNom());
            user.setPrenom(updatedUser.getPrenom());
            user.setEmail(updatedUser.getEmail());
            user.setRole(updatedUser.getRole());
            user.setLogin(updatedUser.getLogin());
            user.setTelephone(updatedUser.getTelephone());
            user.setStatus(updatedUser.getStatus());
            
            // Encoder le mot de passe seulement s'il est fourni et non vide
            if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
                // Vérifier si le mot de passe n'est pas déjà encodé
                if (!updatedUser.getPassword().startsWith("$2a$") && 
                    !updatedUser.getPassword().startsWith("$2b$") && 
                    !updatedUser.getPassword().startsWith("$2y$")) {
                    user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
                } else {
                    user.setPassword(updatedUser.getPassword());
                }
            }
            // Si le mot de passe est null ou vide, on ne le modifie pas
            
            return userRepository.save(user);
        });
    }

    @Audited(action = AuditLog.AuditAction.DELETE, entityType = "User")
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    public boolean loginExists(String login) {
        return userRepository.existsByLogin(login);
    }

    public Optional<User> getUserByLogin(String login) {
        return userRepository.findByLogin(login);
    }

    public List<User> getUsersByRole(User.Role role) {
        return userRepository.findByRole(role);
    }
}