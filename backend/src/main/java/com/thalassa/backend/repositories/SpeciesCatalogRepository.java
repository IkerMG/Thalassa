package com.thalassa.backend.repositories;

import com.thalassa.backend.models.SpeciesCatalog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpeciesCatalogRepository extends JpaRepository<SpeciesCatalog, Long> {

    /**
     * Búsqueda case-insensitive por nombre común o nombre científico.
     * Con query vacía ("") devuelve todo el catálogo (LIKE '%%' siempre es true).
     */
    @Query("SELECT s FROM SpeciesCatalog s WHERE " +
           "LOWER(s.commonName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.scientificName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<SpeciesCatalog> searchByName(@Param("query") String query);
}
