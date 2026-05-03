package com.thalassa.backend.services;

import com.thalassa.backend.dto.WaterParameterRequest;
import com.thalassa.backend.dto.WaterParameterResponse;
import com.thalassa.backend.exceptions.ResourceNotFoundException;
import com.thalassa.backend.models.Aquarium;
import com.thalassa.backend.models.User;
import com.thalassa.backend.models.WaterParameter;
import com.thalassa.backend.repositories.AquariumRepository;
import com.thalassa.backend.repositories.WaterParameterRepository;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
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

  /** Exports all parameter history for an aquarium as a UTF-8 CSV byte array. */
  public ResponseEntity<byte[]> exportCsv(Long aquariumId) {
    User user = getAuthenticatedUser();
    Aquarium aquarium = verifyOwnership(aquariumId, user.getId());

    List<WaterParameter> params =
        parameterRepository.findByAquariumIdOrderByMeasuredAtDesc(aquariumId);
    Collections.reverse(params); // chronological: oldest first

    StringBuilder csv = new StringBuilder();
    csv.append(
        "measuredAt,temperature,salinity,ph,alkalinityDKH,calciumPPM,magnesiumPPM,nitratesPPM,phosphatesPPM\n");
    for (WaterParameter p : params) {
      csv.append(p.getMeasuredAt()).append(',')
          .append(csv(p.getTemperature())).append(',')
          .append(csv(p.getSalinity())).append(',')
          .append(csv(p.getPh())).append(',')
          .append(csv(p.getAlkalinityDKH())).append(',')
          .append(csv(p.getCalciumPPM())).append(',')
          .append(csv(p.getMagnesiumPPM())).append(',')
          .append(csv(p.getNitratesPPM())).append(',')
          .append(csv(p.getPhosphatesPPM())).append('\n');
    }

    String safeName = aquarium.getName().replaceAll("[^a-zA-Z0-9_-]", "_");
    String filename =
        "parameters_" + safeName + "_" + LocalDate.now() + ".csv";
    byte[] bytes = csv.toString().getBytes(StandardCharsets.UTF_8);

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_TYPE, "text/csv; charset=UTF-8")
        .header(
            HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
        .body(bytes);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private static String csv(Double value) {
    return value != null ? value.toString() : "";
  }

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
