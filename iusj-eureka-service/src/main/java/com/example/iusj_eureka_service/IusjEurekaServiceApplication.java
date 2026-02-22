package com.example.iusj_eureka_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@SpringBootApplication
@EnableEurekaServer
public class IusjEurekaServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(IusjEurekaServiceApplication.class, args);
	}

}
