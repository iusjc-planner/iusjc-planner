package com.example.iusj_notification_service.dto;

import com.example.iusj_notification_service.entities.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class BroadcastRequest {

    @NotNull
    private NotificationType type;

    @NotBlank
    @Size(max = 500)
    private String contenu;

    @Size(max = 50)
    private String sourceType;

    private Long sourceId;

    private List<Long> userIds;
}
