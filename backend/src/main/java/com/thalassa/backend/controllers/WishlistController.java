package com.thalassa.backend.controllers;

import com.thalassa.backend.dto.WishlistItemRequest;
import com.thalassa.backend.dto.WishlistItemResponse;
import com.thalassa.backend.dto.WishlistUpdateRequest;
import com.thalassa.backend.services.WishlistService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

  private final WishlistService wishlistService;

  public WishlistController(WishlistService wishlistService) {
    this.wishlistService = wishlistService;
  }

  /** GET /api/wishlist Lista todos los productos guardados por el usuario autenticado. */
  @GetMapping
  public ResponseEntity<List<WishlistItemResponse>> getWishlist() {
    return ResponseEntity.ok(wishlistService.getWishlist());
  }

  /** POST /api/wishlist Guarda un producto del scraper en la wishlist del usuario autenticado. */
  @PostMapping
  public ResponseEntity<WishlistItemResponse> addToWishlist(
      @Valid @RequestBody WishlistItemRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(wishlistService.addToWishlist(request));
  }

  /**
   * PUT /api/wishlist/{id} Actualiza notas y prioridad de un item. Valida ownership antes de
   * modificar.
   */
  @PutMapping("/{id}")
  public ResponseEntity<WishlistItemResponse> updateWishlistItem(
      @PathVariable Long id, @Valid @RequestBody WishlistUpdateRequest request) {
    return ResponseEntity.ok(wishlistService.updateWishlistItem(id, request));
  }

  /**
   * DELETE /api/wishlist/{id} Elimina un producto de la wishlist. Devuelve 404 si no existe o no
   * pertenece al usuario autenticado.
   */
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> removeFromWishlist(@PathVariable Long id) {
    wishlistService.removeFromWishlist(id);
    return ResponseEntity.noContent().build();
  }
}
