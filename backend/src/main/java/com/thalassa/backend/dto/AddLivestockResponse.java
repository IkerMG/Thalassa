package com.thalassa.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddLivestockResponse {

    private LivestockResponse livestock;

    // Solo aparece en el JSON cuando hay un problema de compatibilidad
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String warning;
}
