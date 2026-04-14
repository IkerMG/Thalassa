package com.thalassa.backend.dto;

import com.thalassa.backend.models.LivestockCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LivestockResponse {

    private Long id;
    private String name;
    private LivestockCategory category;
    private Boolean reefSafe;
    private Integer quantity;
    private Long speciesCatalogId;
}
