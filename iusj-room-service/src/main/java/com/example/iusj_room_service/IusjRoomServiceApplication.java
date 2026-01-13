package com.example.iusj_room_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class IusjRoomServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(IusjRoomServiceApplication.class, args);
    }
}
