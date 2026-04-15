package com.thalassa.backend.services;

import com.thalassa.backend.dto.ScraperProductResult;
import com.thalassa.backend.dto.ScraperResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Collections;
import java.util.List;

@Service
public class ScraperService {

    private final RestClient scraperRestClient;

    public ScraperService(RestClient scraperRestClient) {
        this.scraperRestClient = scraperRestClient;
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
            PythonScrapeError error
    ) {}

    // ── Operaciones ───────────────────────────────────────────────────────────

    /**
     * Llama a GET /scrape?keyword={keyword} en el microservicio Python y
     * transforma la respuesta al DTO {@link ScraperResponse} definido en la API.
     *
     * <p>Política de errores — siempre devuelve HTTP 200 al cliente:
     * <ul>
     *   <li>Timeout / conexión rechazada → {@code errorCode = "TIMEOUT_ERROR"}, lista vacía.</li>
     *   <li>Error HTTP del scraper       → {@code errorCode = "SERVICE_UNAVAILABLE"}, lista vacía.</li>
     *   <li>Scraper devuelve error propio → se propaga el código que manda Python.</li>
     * </ul>
     */
    public ScraperResponse search(String keyword) {
        try {
            PythonScrapeResponse pythonResponse = scraperRestClient.get()
                    .uri("/scrape?keyword={keyword}", keyword)
                    .retrieve()
                    .body(PythonScrapeResponse.class);

            if (pythonResponse == null) {
                return emptyResponse(keyword, "SERVICE_UNAVAILABLE");
            }

            // Mapear el objeto error de Python al campo errorCode del DTO de Spring
            String errorCode = (pythonResponse.error() != null)
                    ? pythonResponse.error().code()
                    : null;

            List<ScraperProductResult> results = pythonResponse.results() != null
                    ? pythonResponse.results()
                    : Collections.emptyList();

            return ScraperResponse.builder()
                    .keyword(pythonResponse.keyword())
                    .store(pythonResponse.store())
                    .total(results.size())
                    .results(results)
                    .errorCode(errorCode)
                    .build();

        } catch (ResourceAccessException e) {
            // Timeout de red o conexión rechazada (scraper Python no disponible)
            return emptyResponse(keyword, "TIMEOUT_ERROR");

        } catch (RestClientException e) {
            // Cualquier otro error HTTP (4xx, 5xx del microservicio Python)
            return emptyResponse(keyword, "SERVICE_UNAVAILABLE");
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private ScraperResponse emptyResponse(String keyword, String errorCode) {
        return ScraperResponse.builder()
                .keyword(keyword)
                .store("all")
                .total(0)
                .results(Collections.emptyList())
                .errorCode(errorCode)
                .build();
    }
}
