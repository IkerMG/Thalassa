package com.thalassa.backend.repositories;

import com.thalassa.backend.models.Aquarium;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AquariumRepository extends JpaRepository<Aquarium, Long> {

    /**
     * Lista todos los acuarios pertenecientes al usuario autenticado.
     */
    List<Aquarium> findByUserId(Long userId);

    /**
     * Cuenta los acuarios del usuario — usado para el gate freemium.
     */
    long countByUserId(Long userId);

    /**
     * Búsqueda por ID combinada con verificación de propiedad.
     * Si el acuario existe pero pertenece a otro usuario, devuelve Optional.empty()
     * (tratado como 404, no revelamos que el ID existe).
     */
    Optional<Aquarium> findByIdAndUserId(Long id, Long userId);
}
