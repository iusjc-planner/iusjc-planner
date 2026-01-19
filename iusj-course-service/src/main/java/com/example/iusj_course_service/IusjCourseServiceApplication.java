package com.example.iusj_course_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class IusjCourseServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(IusjCourseServiceApplication.class, args);
    }
}
