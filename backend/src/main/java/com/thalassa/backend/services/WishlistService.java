package com.thalassa.backend.services;

import com.thalassa.backend.dto.WishlistItemRequest;
import com.thalassa.backend.dto.WishlistItemResponse;
import com.thalassa.backend.exceptions.ResourceNotFoundException;
import com.thalassa.backend.models.User;
import com.thalassa.backend.models.WishlistItem;
import com.thalassa.backend.repositories.WishlistRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WishlistService {

    private final WishlistRepository wishlistRepository;

    public WishlistService(WishlistRepository wishlistRepository) {
        this.wishlistRepository = wishlistRepository;
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private User getAuthenticatedUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    // ── Operaciones ───────────────────────────────────────────────────────────

    /**
     * Devuelve todos los productos guardados por el usuario autenticado.
     */
    public List<WishlistItemResponse> getWishlist() {
        User user = getAuthenticatedUser();
        return wishlistRepository.findByUserId(user.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Guarda un producto del scraper en la wishlist del usuario autenticado.
     */
    @Transactional
    public WishlistItemResponse addToWishlist(WishlistItemRequest request) {
        User user = getAuthenticatedUser();

        WishlistItem item = WishlistItem.builder()
                .productName(request.getProductName())
                .price(request.getPrice())
                .imgUrl(request.getImgUrl())
                .productUrl(request.getProductUrl())
                .storeName(request.getStoreName())
                .user(user)
                .build();

        return mapToResponse(wishlistRepository.save(item));
    }

    /**
     * Elimina un item de la wishlist.
     * Valida que el item pertenezca al usuario autenticado (patrón transitivo).
     */
    @Transactional
    public void removeFromWishlist(Long itemId) {
        User user = getAuthenticatedUser();
        WishlistItem item = wishlistRepository.findByIdAndUserId(itemId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Item de wishlist no encontrado."));
        wishlistRepository.delete(item);
    }

    // ── Mapeo ─────────────────────────────────────────────────────────────────

    private WishlistItemResponse mapToResponse(WishlistItem item) {
        return WishlistItemResponse.builder()
                .id(item.getId())
                .productName(item.getProductName())
                .price(item.getPrice())
                .imgUrl(item.getImgUrl())
                .productUrl(item.getProductUrl())
                .storeName(item.getStoreName())
                .build();
    }
}
