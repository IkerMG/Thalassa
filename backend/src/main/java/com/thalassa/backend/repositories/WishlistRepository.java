package com.thalassa.backend.repositories;

import com.thalassa.backend.models.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<WishlistItem, Long> {

    /**
     * Devuelve todos los items de la wishlist de un usuario.
     */
    List<WishlistItem> findByUserId(Long userId);

    /**
     * Busca un item por su ID validando que pertenezca al usuario.
     * Patrón transitivo idéntico al de AquariumRepository y LivestockRepository.
     */
    Optional<WishlistItem> findByIdAndUserId(Long id, Long userId);
}
