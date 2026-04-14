package com.thalassa.backend.dto;

import com.thalassa.backend.models.LivestockCategory;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LivestockRequest {

    @NotBlank(message = "El nombre del espécimen es obligatorio.")
    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres.")
    private String name;

    @NotNull(message = "La categoría es obligatoria.")
    private LivestockCategory category;

    @NotNull(message = "El campo reef-safe es obligatorio.")
    private Boolean reefSafe;

    @NotNull(message = "La cantidad es obligatoria.")
    @Min(value = 1, message = "La cantidad debe ser de al menos 1.")
    private Integer quantity;

    // Nullable: null si el espécimen es personalizado (no proviene del catálogo)
    private Long speciesCatalogId;
}
