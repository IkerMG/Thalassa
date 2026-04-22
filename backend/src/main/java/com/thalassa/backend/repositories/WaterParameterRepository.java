package com.thalassa.backend.repositories;

import com.thalassa.backend.models.WaterParameter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WaterParameterRepository extends JpaRepository<WaterParameter, Long> {

    List<WaterParameter> findByAquariumIdOrderByMeasuredAtDesc(Long aquariumId);

    Optional<WaterParameter> findFirstByAquariumIdOrderByMeasuredAtDesc(Long aquariumId);
}
