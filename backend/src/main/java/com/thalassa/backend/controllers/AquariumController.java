package com.thalassa.backend.controllers;

import com.thalassa.backend.dto.AddLivestockResponse;
import com.thalassa.backend.dto.AquariumDetailResponse;
import com.thalassa.backend.dto.AquariumRequest;
import com.thalassa.backend.dto.AquariumSummaryResponse;
import com.thalassa.backend.dto.EnergyResponse;
import com.thalassa.backend.dto.EquipmentRequest;
import com.thalassa.backend.dto.EquipmentResponse;
import com.thalassa.backend.dto.LivestockRequest;
import com.thalassa.backend.dto.LivestockResponse;
import com.thalassa.backend.services.AquariumService;
import com.thalassa.backend.services.EquipmentService;
import com.thalassa.backend.services.LivestockService;
import jakarta.validation.Valid;
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

import java.util.List;

@RestController
@RequestMapping("/api/aquariums")
public class AquariumController {

    private final AquariumService aquariumService;
    private final EquipmentService equipmentService;
    private final LivestockService livestockService;

    public AquariumController(AquariumService aquariumService,
                              EquipmentService equipmentService,
                              LivestockService livestockService) {
        this.aquariumService = aquariumService;
        this.equipmentService = equipmentService;
        this.livestockService = livestockService;
    }

    // ── Acuarios ──────────────────────────────────────────────────────────────

    /**
     * GET /api/aquariums
     * Lista todos los acuarios del usuario autenticado (vista resumen).
     */
    @GetMapping
    public ResponseEntity<List<AquariumSummaryResponse>> listAquariums() {
        return ResponseEntity.ok(aquariumService.listAquariums());
    }

    /**
     * POST /api/aquariums
     * Crea un nuevo acuario. Gate freemium: FREE solo puede tener 1.
     */
    @PostMapping
    public ResponseEntity<AquariumSummaryResponse> createAquarium(
            @Valid @RequestBody AquariumRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(aquariumService.createAquarium(request));
    }

    /**
     * GET /api/aquariums/{id}
     * Detalle completo del acuario: datos base + equipamiento + fauna.
     */
    @GetMapping("/{id}")
    public ResponseEntity<AquariumDetailResponse> getAquariumDetail(@PathVariable Long id) {
        return ResponseEntity.ok(aquariumService.getAquariumDetail(id));
    }

    /**
     * PUT /api/aquariums/{id}
     * Actualiza nombre, litros y tipo del acuario.
     */
    @PutMapping("/{id}")
    public ResponseEntity<AquariumSummaryResponse> updateAquarium(
            @PathVariable Long id,
            @Valid @RequestBody AquariumRequest request) {
        return ResponseEntity.ok(aquariumService.updateAquarium(id, request));
    }

    /**
     * DELETE /api/aquariums/{id}
     * Elimina el acuario y en cascada todo su equipamiento y fauna.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAquarium(@PathVariable Long id) {
        aquariumService.deleteAquarium(id);
        return ResponseEntity.noContent().build();
    }

    // ── Sub-recurso: Equipamiento ─────────────────────────────────────────────

    /**
     * GET /api/aquariums/{id}/equipment
     * Lista el equipamiento del acuario.
     */
    @GetMapping("/{id}/equipment")
    public ResponseEntity<List<EquipmentResponse>> listEquipment(@PathVariable Long id) {
        return ResponseEntity.ok(equipmentService.listEquipment(id));
    }

    /**
     * POST /api/aquariums/{id}/equipment
     * Añade un equipo al acuario.
     */
    @PostMapping("/{id}/equipment")
    public ResponseEntity<EquipmentResponse> addEquipment(
            @PathVariable Long id,
            @Valid @RequestBody EquipmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(equipmentService.addEquipment(id, request));
    }

    // ── Sub-recurso: Energía ──────────────────────────────────────────────────

    /**
     * GET /api/aquariums/{id}/energy
     * Calcula el coste energético mensual del acuario.
     * Requiere que el usuario tenga el precio del kWh configurado en su perfil.
     */
    @GetMapping("/{id}/energy")
    public ResponseEntity<EnergyResponse> calculateEnergy(@PathVariable Long id) {
        return ResponseEntity.ok(equipmentService.calculateEnergy(id));
    }

    // ── Sub-recurso: Fauna ────────────────────────────────────────────────────

    /**
     * GET /api/aquariums/{id}/livestock
     * Lista la fauna del acuario.
     */
    @GetMapping("/{id}/livestock")
    public ResponseEntity<List<LivestockResponse>> listLivestock(@PathVariable Long id) {
        return ResponseEntity.ok(livestockService.listLivestock(id));
    }

    /**
     * POST /api/aquariums/{id}/livestock
     * Añade un espécimen al acuario. Devuelve advertencia si no es reef-safe
     * en un acuario de tipo MARINO_ARRECIFE.
     */
    @PostMapping("/{id}/livestock")
    public ResponseEntity<AddLivestockResponse> addLivestock(
            @PathVariable Long id,
            @Valid @RequestBody LivestockRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(livestockService.addLivestock(id, request));
    }
}
