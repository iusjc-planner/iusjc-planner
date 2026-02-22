package com.example.iusj_auth_service.security;

import com.example.iusj_auth_service.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class StartupPasswordEncoder {

    @Bean
    public CommandLineRunner encodePasswords(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            userRepository.findAll().forEach(user -> {
                String password = user.getPassword();
                if (password != null && !password.startsWith("$2a$")) {
                    user.setPassword(passwordEncoder.encode(password));
                    userRepository.save(user);
                    System.out.println("Mot de passe encodé pour l'utilisateur : " + user.getLogin());
                }
            });
        };
    }
}