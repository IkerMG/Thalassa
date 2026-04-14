package com.thalassa.backend.dto;

import com.thalassa.backend.models.AquariumType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AquariumRequest {

    @NotBlank(message = "El nombre del acuario es obligatorio.")
    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres.")
    private String name;

    @NotNull(message = "Los litros son obligatorios.")
    @Min(value = 1, message = "El volumen debe ser de al menos 1 litro.")
    private Integer liters;

    @NotNull(message = "El tipo de acuario es obligatorio.")
    private AquariumType type;
}
