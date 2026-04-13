package com.thalassa.backend.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "livestock")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Livestock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Nombre del espécimen (puede ser personalizado si no viene del catálogo).
     */
    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LivestockCategory category;

    /**
     * Se denormaliza aquí para permitir especies personalizadas fuera del catálogo
     * y para una consulta de compatibilidad directa sin JOIN.
     */
    @Column(name = "reef_safe", nullable = false)
    private Boolean reefSafe;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aquarium_id", nullable = false)
    @JsonBackReference("aquarium-livestock")
    private Aquarium aquarium;

    /**
     * Referencia opcional al catálogo de especies. Null cuando el usuario
     * añade un espécimen personalizado que no existe en el catálogo.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "species_catalog_id")
    @JsonIgnoreProperties({"livestock", "hibernateLazyInitializer", "handler"})
    private SpeciesCatalog speciesCatalog;
}
