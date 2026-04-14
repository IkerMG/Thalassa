package com.thalassa.backend.controllers;

import com.thalassa.backend.dto.SpeciesCatalogResponse;
import com.thalassa.backend.services.SpeciesCatalogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/species")
public class SpeciesCatalogController {

    private final SpeciesCatalogService speciesCatalogService;

    public SpeciesCatalogController(SpeciesCatalogService speciesCatalogService) {
        this.speciesCatalogService = speciesCatalogService;
    }

    /**
     * GET /api/species?search=
     * Busca especies por nombre común o científico (case-insensitive).
     * Sin parámetro devuelve el catálogo completo.
     */
    @GetMapping
    public ResponseEntity<List<SpeciesCatalogResponse>> search(
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(speciesCatalogService.search(search));
    }

    /**
     * GET /api/species/{id}
     * Detalle de una especie del catálogo.
     */
    @GetMapping("/{id}")
    public ResponseEntity<SpeciesCatalogResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(speciesCatalogService.getById(id));
    }
}
