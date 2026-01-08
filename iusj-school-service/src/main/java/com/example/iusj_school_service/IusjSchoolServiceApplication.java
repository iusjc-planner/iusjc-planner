package com.example.iusj_school_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class IusjSchoolServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(IusjSchoolServiceApplication.class, args);
    }
}
