package com.thalassa.backend.dto;

import com.thalassa.backend.models.AquariumType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AquariumSummaryResponse {

    private Long id;
    private String name;
    private Integer liters;
    private AquariumType type;
}
