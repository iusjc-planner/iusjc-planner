package com.example.iusj_gateway_service.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PasswordService {

    private final PasswordEncoder passwordEncoder;

    public PasswordService() {
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    /**
     * Vérifie si un mot de passe est déjà encodé avec BCrypt
     * @param password le mot de passe à vérifier
     * @return true si le mot de passe est déjà encodé, false sinon
     */
    public boolean isPasswordEncoded(String password) {
        if (password == null || password.isEmpty()) {
            return false;
        }
        
        // Un mot de passe BCrypt commence toujours par $2a$, $2b$, $2x$, ou $2y$
        // et a une longueur de 60 caractères
        return password.matches("^\\$2[abxy]\\$\\d{2}\\$.{53}$");
    }

    /**
     * Encode un mot de passe s'il n'est pas déjà encodé
     * @param password le mot de passe à encoder
     * @return le mot de passe encodé
     */
    public String encodePasswordIfNeeded(String password) {
        if (password == null || password.isEmpty()) {
            return password;
        }
        
        if (isPasswordEncoded(password)) {
            return password; // Déjà encodé, on le retourne tel quel
        }
        
        return passwordEncoder.encode(password);
    }

    /**
     * Vérifie si un mot de passe en clair correspond à un mot de passe encodé
     * @param rawPassword le mot de passe en clair
     * @param encodedPassword le mot de passe encodé
     * @return true si les mots de passe correspondent
     */
    public boolean matches(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    /**
     * Encode un mot de passe (force l'encodage même s'il est déjà encodé)
     * @param password le mot de passe à encoder
     * @return le mot de passe encodé
     */
    public String encode(String password) {
        return passwordEncoder.encode(password);
    }
}