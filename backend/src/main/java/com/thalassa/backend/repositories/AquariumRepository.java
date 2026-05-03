package com.thalassa.backend.repositories;

import com.thalassa.backend.models.Aquarium;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AquariumRepository extends JpaRepository<Aquarium, Long> {

  List<Aquarium> findByUserId(Long userId);

  long countByUserId(Long userId);

  Optional<Aquarium> findByIdAndUserId(Long id, Long userId);
}
