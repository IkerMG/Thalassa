package com.thalassa.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnergyResponse {

    private Long aquariumId;
    private String aquariumName;
    private BigDecimal totalMonthlyCost;
    private Double electricityPriceKwh;
    private String currencySymbol;
    private List<EquipmentEnergyCost> equipmentBreakdown;
}
