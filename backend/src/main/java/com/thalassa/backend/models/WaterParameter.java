package com.thalassa.backend.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "water_parameters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WaterParameter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aquarium_id", nullable = false)
    @JsonBackReference("aquarium-parameters")
    private Aquarium aquarium;

    // All measurement fields are nullable — users log only what they measured.
    // Ranges (Master Plan §9.2): temp 24–26.5°C, salinity 1.023–1.026 SG,
    // pH 8.0–8.4, KH 7–11, Ca 380–450 ppm, Mg 1250–1400 ppm,
    // NO3 0–10 ppm, PO4 0.00–0.10 ppm.

    @Column
    private Double temperature;

    @Column
    private Double salinity;

    @Column
    private Double ph;

    @Column(name = "alkalinity_dkh")
    private Double alkalinityDKH;

    @Column(name = "calcium_ppm")
    private Double calciumPPM;

    @Column(name = "magnesium_ppm")
    private Double magnesiumPPM;

    @Column(name = "nitrates_ppm")
    private Double nitratesPPM;

    @Column(name = "phosphates_ppm")
    private Double phosphatesPPM;

    @Column(name = "measured_at", nullable = false)
    @Builder.Default
    private LocalDateTime measuredAt = LocalDateTime.now();
}
