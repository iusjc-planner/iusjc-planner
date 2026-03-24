package com.example.iusj_auth_service.service;


import com.example.iusj_auth_service.DTO.LoginRequest;
import com.example.iusj_auth_service.DTO.LoginResponse;
import com.example.iusj_auth_service.entities.User;
import com.example.iusj_auth_service.repository.UserRepository;
import com.example.iusj_auth_service.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, JwtUtil jwtUtil, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
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
}
