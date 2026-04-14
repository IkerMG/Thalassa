package com.thalassa.backend.controllers;

import com.thalassa.backend.dto.LivestockRequest;
import com.thalassa.backend.dto.LivestockResponse;
import com.thalassa.backend.services.LivestockService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/livestock")
public class LivestockController {

    private final LivestockService livestockService;

    public LivestockController(LivestockService livestockService) {
        this.livestockService = livestockService;
    }

    /**
     * PUT /api/livestock/{id}
     * Actualiza los datos de un espécimen (nombre, categoría, reef-safe, cantidad).
     */
    @PutMapping("/{id}")
    public ResponseEntity<LivestockResponse> updateLivestock(
            @PathVariable Long id,
            @Valid @RequestBody LivestockRequest request) {
        return ResponseEntity.ok(livestockService.updateLivestock(id, request));
    }

    /**
     * DELETE /api/livestock/{id}
     * Elimina un espécimen del acuario (baja o venta).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLivestock(@PathVariable Long id) {
        livestockService.deleteLivestock(id);
        return ResponseEntity.noContent().build();
    }
}
