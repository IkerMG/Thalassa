package com.thalassa.backend.repositories;

import com.thalassa.backend.models.Livestock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LivestockRepository extends JpaRepository<Livestock, Long> {

    /**
     * Lista la fauna de un acuario concreto.
     * El llamador debe verificar previamente que el acuario pertenece al usuario.
     */
    List<Livestock> findByAquariumId(Long aquariumId);

    /**
     * Búsqueda de fauna por ID con verificación de propiedad transitiva:
     * livestock.aquarium.user.id == userId.
     * Spring Data JPA resuelve el traversal automáticamente por el nombre del método.
     */
    Optional<Livestock> findByIdAndAquariumUserId(Long id, Long userId);
}
