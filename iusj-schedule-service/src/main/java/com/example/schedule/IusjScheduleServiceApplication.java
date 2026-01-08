package com.example.schedule;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class IusjScheduleServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(IusjScheduleServiceApplication.class, args);
    }
}
