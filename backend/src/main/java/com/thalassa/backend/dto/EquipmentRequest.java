package com.thalassa.backend.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class EquipmentRequest {

    @NotBlank(message = "El nombre del equipo es obligatorio.")
    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres.")
    private String name;

    @NotNull(message = "La potencia en vatios es obligatoria.")
    @Min(value = 1, message = "La potencia debe ser de al menos 1 vatio.")
    private Integer powerWatts;

    @NotNull(message = "Las horas de uso diario son obligatorias.")
    @DecimalMin(value = "0.1", message = "Las horas de uso deben ser al menos 0.1.")
    @DecimalMax(value = "24.0", message = "Las horas de uso no pueden superar las 24 horas.")
    private Double hoursPerDay;
}
