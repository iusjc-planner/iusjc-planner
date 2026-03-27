package com.example.iusj_group_service.dto;

import com.example.iusj_group_service.entities.Group;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SplitGroupRequest {

    @NotNull
    @Min(2)
    @Max(10)
    private Integer count;

    @NotNull
    private Group.GroupType type;
}
