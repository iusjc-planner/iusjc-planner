package com.example.iusj_schedule_service.client;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class GroupServiceClient {

    private final RestTemplate restTemplate;

    public GroupServiceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public GroupSummary getGroup(Long groupId) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> group = restTemplate.getForObject(
                    "http://iusj-group-service/api/groups/{id}",
                    Map.class,
                    groupId
            );
            if (group == null) {
                return null;
            }

            String name = asString(group.get("name"));
            Integer size = asInteger(group.get("size"));
            return new GroupSummary(groupId, name, size);
        } catch (Exception ex) {
            return null;
        }
    }

    private String asString(Object value) {
        return value == null ? null : value.toString();
    }

    private Integer asInteger(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value instanceof String text) {
            try {
                return Integer.parseInt(text);
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

    public record GroupSummary(Long id, String name, Integer size) {
    }
}
