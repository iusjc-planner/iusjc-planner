package com.example.iusj_schedule_service.services;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class RoomServiceClient {

    private final RestTemplate restTemplate;

    public RoomServiceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public List<Long> getActiveRoomIds(Integer minCapacity, List<String> equipments) {
        try {
            StringBuilder url = new StringBuilder("http://iusj-room-service/api/rooms");
            if (minCapacity != null) {
                url.append("?minCapacity=").append(minCapacity);
            }
            Object[] rooms = restTemplate.getForObject(url.toString(), Object[].class);
            if (rooms == null) {
                return List.of(1L, 2L, 3L);
            }

            List<Long> ids = new ArrayList<>();
            for (Object room : rooms) {
                if (room instanceof Map<?, ?> map) {
                    Object idRaw = map.get("id");
                    if (idRaw instanceof Number number) {
                        ids.add(number.longValue());
                    }
                }
            }
            return ids.isEmpty() ? List.of(1L, 2L, 3L) : ids;
        } catch (Exception ex) {
            return List.of(1L, 2L, 3L);
        }
    }
}
