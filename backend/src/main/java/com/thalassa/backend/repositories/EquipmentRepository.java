package com.thalassa.backend.repositories;

import com.thalassa.backend.models.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    /**
     * Lista el equipamiento de un acuario concreto.
     * El llamador debe verificar previamente que el acuario pertenece al usuario.
     */
    List<Equipment> findByAquariumId(Long aquariumId);

    /**
     * Búsqueda de equipamiento por ID con verificación de propiedad transitiva:
     * equipment.aquarium.user.id == userId.
     * Spring Data JPA resuelve el traversal automáticamente por el nombre del método.
     */
    Optional<Equipment> findByIdAndAquariumUserId(Long id, Long userId);
}
