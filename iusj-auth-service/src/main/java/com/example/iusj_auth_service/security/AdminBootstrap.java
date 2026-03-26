package com.example.iusj_auth_service.security;

import com.example.iusj_auth_service.entities.User;
import com.example.iusj_auth_service.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminBootstrap {

    private static final Logger LOGGER = LoggerFactory.getLogger(AdminBootstrap.class);

    private static final String ADMIN_LOGIN = "admin";
    private static final String ADMIN_EMAIL = "admin@iusjplanner.com";
    private static final String ADMIN_PASSWORD = "ADmin123!";

    @Bean
    ApplicationRunner ensureDefaultAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            User admin = userRepository.findByLogin(ADMIN_LOGIN).orElseGet(User::new);

            admin.setNom("Administrateur");
            admin.setPrenom("IUSJ");
            admin.setEmail(ADMIN_EMAIL);
            admin.setLogin(ADMIN_LOGIN);
            admin.setPassword(passwordEncoder.encode(ADMIN_PASSWORD));
            admin.setRole(User.Role.ADMIN);

            userRepository.save(admin);
            LOGGER.info("Compte admin initialise/mis a jour: login={}, email={}", ADMIN_LOGIN, ADMIN_EMAIL);
        };
    }
}
