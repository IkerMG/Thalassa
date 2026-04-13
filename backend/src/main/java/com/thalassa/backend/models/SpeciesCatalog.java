package com.thalassa.backend.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "species_catalog")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpeciesCatalog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "common_name", nullable = false, length = 100)
    private String commonName;

    @Column(name = "scientific_name", nullable = false, length = 150)
    private String scientificName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LivestockCategory category;

    @Column(name = "reef_safe", nullable = false)
    private Boolean reefSafe;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(length = 1000)
    private String notes;

    // Relación inversa: no se serializa para evitar N+1 y referencias circulares
    @OneToMany(mappedBy = "speciesCatalog")
    @JsonIgnore
    @Builder.Default
    private List<Livestock> livestock = new ArrayList<>();
}
