package com.example.iusj_user_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class IusjUserServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(IusjUserServiceApplication.class, args);
	}

}
