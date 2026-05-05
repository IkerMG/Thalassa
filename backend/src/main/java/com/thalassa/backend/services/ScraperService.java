package com.thalassa.backend.services;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thalassa.backend.dto.ScraperProductResult;
import com.thalassa.backend.dto.ScraperResponse;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
public class ScraperService {

  private static final Logger log = LoggerFactory.getLogger(ScraperService.class);

  private final RestClient scraperRestClient;
  private final ObjectMapper objectMapper;

  public ScraperService(RestClient scraperRestClient, ObjectMapper objectMapper) {
    this.scraperRestClient = scraperRestClient;
    this.objectMapper = objectMapper;
  }

  // ── Records internos ──────────────────────────────────────────────────────
  // Espejean la estructura real del JSON que devuelve el microservicio Python.
  // La respuesta Python usa snake_case y el campo de error es un objeto,
  // no un String; de ahí que no podamos deserializar directamente en ScraperResponse.

  private record PythonScrapeError(String code, String message) {}

  private record PythonScrapeResponse(
      String keyword,
      String store,
      Integer total,
      List<ScraperProductResult> results,
      PythonScrapeError error) {}

  // ── Operaciones ───────────────────────────────────────────────────────────

  /**
   * Llama a GET /scrape?keyword={keyword} en el microservicio Python y transforma la respuesta al
   * DTO {@link ScraperResponse} definido en la API.
   *
   * <p>Política de errores — siempre devuelve HTTP 200 al cliente:
   *
   * <ul>
   *   <li>Timeout / conexión rechazada → {@code errorCode = "TIMEOUT_ERROR"}, lista vacía.
   *   <li>Error HTTP del scraper → {@code errorCode = "SERVICE_UNAVAILABLE"}, lista vacía.
   *   <li>Scraper devuelve error propio → se propaga el código que manda Python.
   * </ul>
   */
  public ScraperResponse search(String keyword) {
    try {
      PythonScrapeResponse pythonResponse =
          scraperRestClient
              .get()
              .uri("/scrape?keyword={keyword}", keyword)
              .retrieve()
              .body(PythonScrapeResponse.class);

      if (pythonResponse == null) {
        return emptyResponse(keyword, "SERVICE_UNAVAILABLE");
      }

      // Mapear el objeto error de Python al campo errorCode del DTO de Spring
      String errorCode = (pythonResponse.error() != null) ? pythonResponse.error().code() : null;

      List<ScraperProductResult> results =
          pythonResponse.results() != null ? pythonResponse.results() : Collections.emptyList();

      // Si Python devuelve error o lista vacía → intentar seed cache
      if (errorCode != null || results.isEmpty()) {
        ScraperResponse cached = loadFromSeedCache(keyword);
        if (cached != null) return cached;
      }

      List<ScraperProductResult> normalized = results.stream()
          .map(p -> ScraperProductResult.builder()
              .name(p.getName())
              .price(p.getPrice())
              .productUrl(normalizeUrl(p.getProductUrl()))
              .imgUrl(normalizeUrl(p.getImgUrl()))
              .storeName(p.getStoreName())
              .build())
          .toList();

      return ScraperResponse.builder()
          .keyword(pythonResponse.keyword())
          .store(pythonResponse.store())
          .total(normalized.size())
          .results(normalized)
          .errorCode(null)
          .fromCache(false)
          .build();

    } catch (ResourceAccessException e) {
      ScraperResponse cached = loadFromSeedCache(keyword);
      return cached != null ? cached : emptyResponse(keyword, "TIMEOUT_ERROR");

    } catch (RestClientException e) {
      ScraperResponse cached = loadFromSeedCache(keyword);
      return cached != null ? cached : emptyResponse(keyword, "SERVICE_UNAVAILABLE");
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private ScraperResponse loadFromSeedCache(String keyword) {
    String[] seedFiles = {"urbannatura", "cetamar"};
    List<ScraperProductResult> matched = new ArrayList<>();
    List<ScraperProductResult> all = new ArrayList<>();

    for (String store : seedFiles) {
      try {
        ClassPathResource resource = new ClassPathResource("market-seed/" + store + ".json");
        if (!resource.exists()) continue;
        try (InputStream is = resource.getInputStream()) {
          List<ScraperProductResult> items = objectMapper.readValue(is, new TypeReference<>() {});
          for (ScraperProductResult p : items) {
            ScraperProductResult normalized = ScraperProductResult.builder()
                .name(p.getName())
                .price(p.getPrice())
                .productUrl(normalizeUrl(p.getProductUrl()))
                .imgUrl(normalizeUrl(p.getImgUrl()))
                .storeName(p.getStoreName())
                .build();
            all.add(normalized);
            if (p.getName() != null && p.getName().toLowerCase().contains(keyword.toLowerCase())) {
              matched.add(normalized);
            }
          }
        }
      } catch (Exception e) {
        log.warn("No se pudo cargar el seed del mercado [{}]: {}", store, e.getMessage());
      }
    }

    List<ScraperProductResult> results = matched.isEmpty() ? all : matched;
    if (results.isEmpty()) return null;

    return ScraperResponse.builder()
        .keyword(keyword)
        .store("cache")
        .total(results.size())
        .results(results)
        .errorCode(null)
        .fromCache(true)
        .build();
  }

  private String normalizeUrl(String url) {
    if (url == null || url.isBlank()) return null;
    String t = url.trim();
    if (t.matches("^https?://.*")) return t;
    if (t.startsWith("//")) return "https:" + t;
    if (t.matches("^([a-z0-9-]+\\.)+[a-z]{2,}(/.*)?$")) return "https://" + t;
    return null;
  }

  private ScraperResponse emptyResponse(String keyword, String errorCode) {
    return ScraperResponse.builder()
        .keyword(keyword)
        .store("all")
        .total(0)
        .results(Collections.emptyList())
        .errorCode(errorCode)
        .fromCache(false)
        .build();
  }
}
