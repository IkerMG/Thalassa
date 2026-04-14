package com.thalassa.backend.services;

import com.thalassa.backend.dto.*;
import com.thalassa.backend.exceptions.AccessDeniedException;
import com.thalassa.backend.exceptions.ResourceNotFoundException;
import com.thalassa.backend.models.Aquarium;
import com.thalassa.backend.models.SubscriptionPlan;
import com.thalassa.backend.models.User;
import com.thalassa.backend.repositories.AquariumRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AquariumService {

    private final AquariumRepository aquariumRepository;

    public AquariumService(AquariumRepository aquariumRepository) {
        this.aquariumRepository = aquariumRepository;
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private User getAuthenticatedUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    // ── Operaciones ───────────────────────────────────────────────────────────

    public List<AquariumSummaryResponse> listAquariums() {
        User user = getAuthenticatedUser();
        return aquariumRepository.findByUserId(user.getId())
                .stream()
                .map(this::mapToSummary)
                .toList();
    }

    public AquariumDetailResponse getAquariumDetail(Long aquariumId) {
        User user = getAuthenticatedUser();
        Aquarium aquarium = aquariumRepository.findByIdAndUserId(aquariumId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Acuario no encontrado."));
        return mapToDetail(aquarium);
    }

    /**
     * Gate freemium: los usuarios FREE solo pueden tener 1 acuario.
     */
    @Transactional
    public AquariumSummaryResponse createAquarium(AquariumRequest request) {
        User user = getAuthenticatedUser();

        if (user.getSubscriptionPlan() == SubscriptionPlan.FREE) {
            long count = aquariumRepository.countByUserId(user.getId());
            if (count >= 1) {
                throw new AccessDeniedException(
                        "El plan FREE solo permite 1 acuario. Actualiza a REEFMASTER para crear más.");
            }
        }

        Aquarium aquarium = Aquarium.builder()
                .name(request.getName())
                .liters(request.getLiters())
                .type(request.getType())
                .user(user)
                .build();

        return mapToSummary(aquariumRepository.save(aquarium));
    }

    @Transactional
    public AquariumSummaryResponse updateAquarium(Long aquariumId, AquariumRequest request) {
        User user = getAuthenticatedUser();
        Aquarium aquarium = aquariumRepository.findByIdAndUserId(aquariumId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Acuario no encontrado."));

        aquarium.setName(request.getName());
        aquarium.setLiters(request.getLiters());
        aquarium.setType(request.getType());

        return mapToSummary(aquariumRepository.save(aquarium));
    }

    @Transactional
    public void deleteAquarium(Long aquariumId) {
        User user = getAuthenticatedUser();
        Aquarium aquarium = aquariumRepository.findByIdAndUserId(aquariumId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Acuario no encontrado."));
        aquariumRepository.delete(aquarium);
    }

    // ── Mapeo ─────────────────────────────────────────────────────────────────

    private AquariumSummaryResponse mapToSummary(Aquarium aquarium) {
        return AquariumSummaryResponse.builder()
                .id(aquarium.getId())
                .name(aquarium.getName())
                .liters(aquarium.getLiters())
                .type(aquarium.getType())
                .build();
    }

    private AquariumDetailResponse mapToDetail(Aquarium aquarium) {
        List<EquipmentResponse> equipment = aquarium.getEquipment().stream()
                .map(e -> EquipmentResponse.builder()
                        .id(e.getId())
                        .name(e.getName())
                        .powerWatts(e.getPowerWatts())
                        .hoursPerDay(e.getHoursPerDay())
                        .build())
                .toList();

        List<LivestockResponse> livestock = aquarium.getLivestock().stream()
                .map(l -> LivestockResponse.builder()
                        .id(l.getId())
                        .name(l.getName())
                        .category(l.getCategory())
                        .reefSafe(l.getReefSafe())
                        .quantity(l.getQuantity())
                        .speciesCatalogId(l.getSpeciesCatalog() != null
                                ? l.getSpeciesCatalog().getId() : null)
                        .build())
                .toList();

        return AquariumDetailResponse.builder()
                .id(aquarium.getId())
                .name(aquarium.getName())
                .liters(aquarium.getLiters())
                .type(aquarium.getType())
                .equipment(equipment)
                .livestock(livestock)
                .build();
    }
}
