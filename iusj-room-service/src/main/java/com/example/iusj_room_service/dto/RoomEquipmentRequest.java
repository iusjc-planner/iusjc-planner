package com.example.iusj_room_service.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomEquipmentRequest {

    @NotNull
    private Long resourceId;

    @NotNull
    @Min(1)
    private Integer quantite;
}
