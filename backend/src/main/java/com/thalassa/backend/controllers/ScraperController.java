package com.thalassa.backend.controllers;

import com.thalassa.backend.dto.ScraperResponse;
import com.thalassa.backend.services.ScraperService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/scraper")
public class ScraperController {

    private final ScraperService scraperService;

    public ScraperController(ScraperService scraperService) {
        this.scraperService = scraperService;
    }

    /**
     * GET /api/scraper/search?keyword=...
     * Proxy al microservicio Python. Siempre devuelve 200 OK;
     * si el scraper no responde, el campo errorCode indica el motivo.
     */
    @GetMapping("/search")
    public ResponseEntity<ScraperResponse> search(
            @RequestParam String keyword) {
        return ResponseEntity.ok(scraperService.search(keyword));
    }
}
