package com.thalassa.backend.services;

import com.thalassa.backend.dto.AddLivestockResponse;
import com.thalassa.backend.dto.LivestockRequest;
import com.thalassa.backend.dto.LivestockResponse;
import com.thalassa.backend.exceptions.ResourceNotFoundException;
import com.thalassa.backend.models.Aquarium;
import com.thalassa.backend.models.AquariumType;
import com.thalassa.backend.models.Livestock;
import com.thalassa.backend.models.SpeciesCatalog;
import com.thalassa.backend.models.User;
import com.thalassa.backend.repositories.AquariumRepository;
import com.thalassa.backend.repositories.LivestockRepository;
import com.thalassa.backend.repositories.SpeciesCatalogRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LivestockService {

    private final LivestockRepository livestockRepository;
    private final AquariumRepository aquariumRepository;
    private final SpeciesCatalogRepository speciesCatalogRepository;

    public LivestockService(LivestockRepository livestockRepository,
                            AquariumRepository aquariumRepository,
                            SpeciesCatalogRepository speciesCatalogRepository) {
        this.livestockRepository = livestockRepository;
        this.aquariumRepository = aquariumRepository;
        this.speciesCatalogRepository = speciesCatalogRepository;
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private User getAuthenticatedUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private Aquarium getOwnedAquarium(Long aquariumId, Long userId) {
        return aquariumRepository.findByIdAndUserId(aquariumId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Acuario no encontrado."));
    }

    // ── Operaciones ───────────────────────────────────────────────────────────

    public List<LivestockResponse> listLivestock(Long aquariumId) {
        User user = getAuthenticatedUser();
        getOwnedAquarium(aquariumId, user.getId());
        return livestockRepository.findByAquariumId(aquariumId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Añade un espécimen. Si el acuario es REEF y el espécimen no es
     * reef-safe, se incluye un campo warning en la respuesta (sin bloquear).
     */
    @Transactional
    public AddLivestockResponse addLivestock(Long aquariumId, LivestockRequest request) {
        User user = getAuthenticatedUser();
        Aquarium aquarium = getOwnedAquarium(aquariumId, user.getId());

        SpeciesCatalog species = null;
        if (request.getSpeciesCatalogId() != null) {
            species = speciesCatalogRepository.findById(request.getSpeciesCatalogId())
                    .orElseThrow(() -> new ResourceNotFoundException("Especie del catálogo no encontrada."));
        }

        Livestock livestock = Livestock.builder()
                .name(request.getName())
                .category(request.getCategory())
                .reefSafe(request.getReefSafe())
                .quantity(request.getQuantity())
                .aquarium(aquarium)
                .speciesCatalog(species)
                .build();

        Livestock saved = livestockRepository.save(livestock);

        String warning = null;
        if (aquarium.getType() == AquariumType.REEF && Boolean.FALSE.equals(saved.getReefSafe())) {
            warning = "Advertencia: este espécimen no es reef-safe y el acuario es de tipo arrecife.";
        }

        return AddLivestockResponse.builder()
                .livestock(mapToResponse(saved))
                .warning(warning)
                .build();
    }

    @Transactional
    public LivestockResponse updateLivestock(Long livestockId, LivestockRequest request) {
        User user = getAuthenticatedUser();
        Livestock livestock = livestockRepository.findByIdAndAquariumUserId(livestockId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Espécimen no encontrado."));

        livestock.setName(request.getName());
        livestock.setCategory(request.getCategory());
        livestock.setReefSafe(request.getReefSafe());
        livestock.setQuantity(request.getQuantity());

        if (request.getSpeciesCatalogId() != null) {
            SpeciesCatalog species = speciesCatalogRepository.findById(request.getSpeciesCatalogId())
                    .orElseThrow(() -> new ResourceNotFoundException("Especie del catálogo no encontrada."));
            livestock.setSpeciesCatalog(species);
        } else {
            livestock.setSpeciesCatalog(null);
        }

        return mapToResponse(livestockRepository.save(livestock));
    }

    @Transactional
    public void deleteLivestock(Long livestockId) {
        User user = getAuthenticatedUser();
        Livestock livestock = livestockRepository.findByIdAndAquariumUserId(livestockId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Espécimen no encontrado."));
        livestockRepository.delete(livestock);
    }

    // ── Mapeo ─────────────────────────────────────────────────────────────────

    private LivestockResponse mapToResponse(Livestock l) {
        return LivestockResponse.builder()
                .id(l.getId())
                .name(l.getName())
                .category(l.getCategory())
                .reefSafe(l.getReefSafe())
                .quantity(l.getQuantity())
                .speciesCatalogId(l.getSpeciesCatalog() != null
                        ? l.getSpeciesCatalog().getId() : null)
                .build();
    }
}
