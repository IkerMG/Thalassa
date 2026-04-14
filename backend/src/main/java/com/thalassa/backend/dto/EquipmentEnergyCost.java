package com.thalassa.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentEnergyCost {

    private Long equipmentId;
    private String name;
    private Integer powerWatts;
    private Double hoursPerDay;
    private BigDecimal monthlyCost;
}
