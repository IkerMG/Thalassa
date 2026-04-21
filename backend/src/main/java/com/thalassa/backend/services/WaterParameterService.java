package com.thalassa.backend.services;

import com.thalassa.backend.dto.WaterParameterRequest;
import com.thalassa.backend.dto.WaterParameterResponse;
import com.thalassa.backend.exceptions.ResourceNotFoundException;
import com.thalassa.backend.models.Aquarium;
import com.thalassa.backend.models.User;
import com.thalassa.backend.models.WaterParameter;
import com.thalassa.backend.repositories.AquariumRepository;
import com.thalassa.backend.repositories.WaterParameterRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class WaterParameterService {

    private final WaterParameterRepository parameterRepository;
    private final AquariumRepository aquariumRepository;

    public WaterParameterService(WaterParameterRepository parameterRepository,
                                  AquariumRepository aquariumRepository) {
        this.parameterRepository = parameterRepository;
        this.aquariumRepository = aquariumRepository;
    }

    private User getAuthenticatedUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    // ── Operaciones ───────────────────────────────────────────────────────────

    public List<WaterParameterResponse> getHistory(Long aquariumId) {
        User user = getAuthenticatedUser();
        verifyOwnership(aquariumId, user.getId());
        return parameterRepository.findByAquariumIdOrderByMeasuredAtDesc(aquariumId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public WaterParameterResponse logParameter(Long aquariumId, WaterParameterRequest req) {
        User user = getAuthenticatedUser();
        Aquarium aquarium = verifyOwnership(aquariumId, user.getId());

        LocalDateTime measuredAt = (req.getMeasuredAt() != null)
                ? req.getMeasuredAt()
                : LocalDateTime.now();

        WaterParameter param = WaterParameter.builder()
                .aquarium(aquarium)
                .temperature(req.getTemperature())
                .salinity(req.getSalinity())
                .ph(req.getPh())
                .alkalinityDKH(req.getAlkalinityDKH())
                .calciumPPM(req.getCalciumPPM())
                .magnesiumPPM(req.getMagnesiumPPM())
                .nitratesPPM(req.getNitratesPPM())
                .phosphatesPPM(req.getPhosphatesPPM())
                .measuredAt(measuredAt)
                .build();

        return mapToResponse(parameterRepository.save(param));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Aquarium verifyOwnership(Long aquariumId, Long userId) {
        return aquariumRepository.findByIdAndUserId(aquariumId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Aquarium not found."));
    }

    private WaterParameterResponse mapToResponse(WaterParameter p) {
        return WaterParameterResponse.builder()
                .id(p.getId())
                .aquariumId(p.getAquarium().getId())
                .temperature(p.getTemperature())
                .salinity(p.getSalinity())
                .ph(p.getPh())
                .alkalinityDKH(p.getAlkalinityDKH())
                .calciumPPM(p.getCalciumPPM())
                .magnesiumPPM(p.getMagnesiumPPM())
                .nitratesPPM(p.getNitratesPPM())
                .phosphatesPPM(p.getPhosphatesPPM())
                .measuredAt(p.getMeasuredAt())
                .build();
    }
}
