package com.thalassa.backend.dto;

import com.thalassa.backend.models.AquariumType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AquariumDetailResponse {

    private Long id;
    private String name;
    private Integer liters;
    private AquariumType type;
    private List<EquipmentResponse> equipment;
    private List<LivestockResponse> livestock;
}
