package com.thalassa.backend.repositories;

import com.thalassa.backend.models.Aquarium;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AquariumRepository extends JpaRepository<Aquarium, Long> {

  List<Aquarium> findByUserId(Long userId);

  long countByUserId(Long userId);

  /**
   * Carga el acuario junto con sus colecciones en una sola query JOIN. Elimina el N+1 (B-6) y evita
   * LazyInitializationException (B-11) en cualquier contexto que acceda a equipment o livestock.
   */
  @EntityGraph(attributePaths = {"equipment", "livestock"})
  Optional<Aquarium> findByIdAndUserId(Long id, Long userId);
}
