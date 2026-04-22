package com.thalassa.backend.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "equipment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    /**
     * Potencia del equipo en vatios. Usada en la fórmula:
     * (watts / 1000) * hoursPerDay * 30 * electricityPriceKwh
     */
    @Column(name = "power_watts", nullable = false)
    private Integer powerWatts;

    /**
     * Horas de funcionamiento diario. Permite decimales (ej: 6.5h).
     */
    @Column(name = "hours_per_day", nullable = false)
    private Double hoursPerDay;

    @Enumerated(EnumType.STRING)
    @Column
    private EquipmentCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aquarium_id", nullable = false)
    @JsonBackReference("aquarium-equipment")
    private Aquarium aquarium;
}
