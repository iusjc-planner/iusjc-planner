package com.example.iusj_auth_service.service;


import com.example.iusj_auth_service.DTO.LoginRequest;
import com.example.iusj_auth_service.DTO.LoginResponse;
import com.example.iusj_auth_service.entities.PasswordResetToken;
import com.example.iusj_auth_service.entities.User;
import com.example.iusj_auth_service.repository.PasswordResetTokenRepository;
import com.example.iusj_auth_service.repository.UserRepository;
import com.example.iusj_auth_service.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(
            UserRepository userRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            JwtUtil jwtUtil,
            PasswordEncoder passwordEncoder,
            EmailService emailService
    ) {
        this.userRepository = userRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByLogin(request.getLogin())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Vérifier si le mot de passe en base est encodé
        if (isPasswordEncoded(user.getPassword())) {
            // Mot de passe encodé, utiliser la vérification BCrypt
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                throw new RuntimeException("Mot de passe incorrect");
            }
        } else {
            // Mot de passe non encodé, comparer directement puis encoder et sauvegarder
            if (!request.getPassword().equals(user.getPassword())) {
                throw new RuntimeException("Mot de passe incorrect");
            }
            
            // Encoder le mot de passe et le sauvegarder pour les prochaines connexions
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            userRepository.save(user);
        }

        String token = jwtUtil.generateToken(user.getLogin(), user.getRole().name(), user.getId());
        return new LoginResponse(token);
    }

    public String generateResetToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Aucun compte associe a cet email"));

        passwordResetTokenRepository.deleteByUserId(user.getId());

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUserId(user.getId());
        resetToken.setToken(buildToken());
        resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(30));
        resetToken.setUsed(false);

        return passwordResetTokenRepository.save(resetToken).getToken();
    }

    public void sendPasswordResetEmail(String email) {
        String token = generateResetToken(email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Aucun compte associe a cet email"));
        String name = (user.getPrenom() != null ? user.getPrenom() : "") + " " + (user.getNom() != null ? user.getNom() : "");
        emailService.sendPasswordResetEmail(email, name.trim(), token);
    }

    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token de reinitialisation invalide"));

        if (resetToken.isUsed()) {
            throw new RuntimeException("Ce token a deja ete utilise");
        }

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Ce token a expire");
        }

        User user = userRepository.findById(resetToken.getUserId())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable pour ce token"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }

    /**
     * Vérifie si un mot de passe est déjà encodé avec BCrypt
     * @param password le mot de passe à vérifier
     * @return true si le mot de passe est déjà encodé, false sinon
     */
    private boolean isPasswordEncoded(String password) {
        if (password == null || password.isEmpty()) {
            return false;
        }
        
        // Un mot de passe BCrypt commence toujours par $2a$, $2b$, $2x$, ou $2y$
        // et a une longueur de 60 caractères
        return password.matches("^\\$2[abxy]\\$\\d{2}\\$.{53}$");
    }

    private String buildToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
