package com.example.iusj_user_service;

import com.example.iusj_user_service.entities.User;
import com.example.iusj_user_service.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class IusjUserServiceApplication {

	private static final Logger logger = LoggerFactory.getLogger(IusjUserServiceApplication.class);

	public static void main(String[] args) {
		SpringApplication.run(IusjUserServiceApplication.class, args);
	}

	@Bean
	CommandLineRunner bootstrapDefaultAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			if (userRepository.count() > 0) {
				return;
			}

			User admin = new User();
			admin.setEmail("admin@iusjplanner.com");
			admin.setLogin("admin");
			admin.setNom("Administrateur");
			admin.setPrenom("IUSJ");
			admin.setPassword(passwordEncoder.encode("ADmin123!"));
			admin.setRole(User.Role.ADMIN);
			admin.setStatus(User.Status.ACTIVE);
			admin.setTelephone(0L);

			userRepository.save(admin);
			logger.warn("Table users vide detectee: admin par defaut cree (login=admin, email=admin@iusjplanner.com)");
		};
	}

}
