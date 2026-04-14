package com.thalassa.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateUserRequest {

    @NotNull(message = "El precio del kWh no puede ser nulo.")
    @DecimalMin(value = "0.0", message = "El precio del kWh no puede ser negativo.")
    private Double electricityPriceKwh;
}
