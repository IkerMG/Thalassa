package com.thalassa.backend.services;

import com.thalassa.backend.dto.WaterParameterRequest;
import com.thalassa.backend.dto.WaterParameterResponse;
import com.thalassa.backend.exceptions.ResourceNotFoundException;
import com.thalassa.backend.models.Aquarium;
import com.thalassa.backend.models.User;
import com.thalassa.backend.models.WaterParameter;
import com.thalassa.backend.repositories.AquariumRepository;
import com.thalassa.backend.repositories.WaterParameterRepository;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WaterParameterService {

  private final WaterParameterRepository parameterRepository;
  private final AquariumRepository aquariumRepository;

  public WaterParameterService(
      WaterParameterRepository parameterRepository, AquariumRepository aquariumRepository) {
    this.parameterRepository = parameterRepository;
    this.aquariumRepository = aquariumRepository;
  }

  private User getAuthenticatedUser() {
    return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
  }

  // ── Operaciones ───────────────────────────────────────────────────────────

  /**
   * Historial paginado con filtro de rango opcional. Si {@code from}/{@code to} son null se usa el
   * rango máximo posible. El tamaño de página se limita a 200 para proteger la base de datos.
   */
  public Page<WaterParameterResponse> getHistory(
      Long aquariumId, LocalDateTime from, LocalDateTime to, int page, int size) {
    User user = getAuthenticatedUser();
    verifyOwnership(aquariumId, user.getId());

    LocalDateTime effectiveFrom = (from != null) ? from : LocalDateTime.of(2000, 1, 1, 0, 0);
    LocalDateTime effectiveTo = (to != null) ? to : LocalDateTime.now().plusDays(1);
    int cappedSize = Math.min(size, 200);

    PageRequest pageable = PageRequest.of(page, cappedSize, Sort.by("measuredAt").descending());

    return parameterRepository
        .findByAquariumIdAndMeasuredAtBetweenOrderByMeasuredAtDesc(
            aquariumId, effectiveFrom, effectiveTo, pageable)
        .map(this::mapToResponse);
  }

  @Transactional
  public WaterParameterResponse logParameter(Long aquariumId, WaterParameterRequest req) {
    User user = getAuthenticatedUser();
    Aquarium aquarium = verifyOwnership(aquariumId, user.getId());

    LocalDateTime measuredAt =
        (req.getMeasuredAt() != null) ? req.getMeasuredAt() : LocalDateTime.now();

    WaterParameter param =
        WaterParameter.builder()
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
    return aquariumRepository
        .findByIdAndUserId(aquariumId, userId)
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
