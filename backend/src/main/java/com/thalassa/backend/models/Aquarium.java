package com.thalassa.backend.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "aquariums")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Aquarium {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private Integer liters;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AquariumType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference("user-aquariums")
    private User user;

    @OneToMany(mappedBy = "aquarium", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("aquarium-livestock")
    @Builder.Default
    private List<Livestock> livestock = new ArrayList<>();

    @OneToMany(mappedBy = "aquarium", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("aquarium-equipment")
    @Builder.Default
    private List<Equipment> equipment = new ArrayList<>();

    @OneToMany(mappedBy = "aquarium", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("aquarium-parameters")
    @Builder.Default
    private List<WaterParameter> waterParameters = new ArrayList<>();
}
