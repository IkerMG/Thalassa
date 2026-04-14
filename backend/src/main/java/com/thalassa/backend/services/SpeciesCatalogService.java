package com.thalassa.backend.services;

import com.thalassa.backend.dto.SpeciesCatalogResponse;
import com.thalassa.backend.exceptions.ResourceNotFoundException;
import com.thalassa.backend.models.SpeciesCatalog;
import com.thalassa.backend.repositories.SpeciesCatalogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SpeciesCatalogService {

    private final SpeciesCatalogRepository speciesCatalogRepository;

    public SpeciesCatalogService(SpeciesCatalogRepository speciesCatalogRepository) {
        this.speciesCatalogRepository = speciesCatalogRepository;
    }

    // ── Operaciones ───────────────────────────────────────────────────────────

    /**
     * Busca por nombre común o científico (case-insensitive).
     * Query vacía/nula devuelve el catálogo completo.
     */
    public List<SpeciesCatalogResponse> search(String query) {
        String q = (query == null) ? "" : query.trim();
        return speciesCatalogRepository.searchByName(q)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public SpeciesCatalogResponse getById(Long id) {
        SpeciesCatalog species = speciesCatalogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Especie no encontrada en el catálogo."));
        return mapToResponse(species);
    }

    // ── Mapeo ─────────────────────────────────────────────────────────────────

    private SpeciesCatalogResponse mapToResponse(SpeciesCatalog s) {
        return SpeciesCatalogResponse.builder()
                .id(s.getId())
                .commonName(s.getCommonName())
                .scientificName(s.getScientificName())
                .category(s.getCategory())
                .reefSafe(s.getReefSafe())
                .imageUrl(s.getImageUrl())
                .notes(s.getNotes())
                .build();
    }
}
