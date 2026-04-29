package com.thalassa.backend.repositories;

import com.thalassa.backend.models.WaterParameter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WaterParameterRepository extends JpaRepository<WaterParameter, Long> {

    List<WaterParameter> findByAquariumIdOrderByMeasuredAtDesc(Long aquariumId);

    Optional<WaterParameter> findFirstByAquariumIdOrderByMeasuredAtDesc(Long aquariumId);

    /** Paginación con filtro de rango opcional. Ordena de más reciente a más antigua. */
    Page<WaterParameter> findByAquariumIdAndMeasuredAtBetweenOrderByMeasuredAtDesc(
            Long aquariumId, LocalDateTime from, LocalDateTime to, Pageable pageable);
}
