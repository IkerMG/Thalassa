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
public class SpeciesCatalogResponse {

    private Long id;
    private String commonName;
    private String scientificName;
    private LivestockCategory category;
    private Boolean reefSafe;
    private String imageUrl;
    private String notes;
}
