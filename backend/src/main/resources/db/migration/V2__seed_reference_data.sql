-- ============================================================
--  Thalassa — V2: Datos de referencia (catálogo de especies)
--
--  Idempotente: ON CONFLICT DO NOTHING.
--  Son datos de referencia inmutables que deben estar en todos
--  los entornos (dev, staging, prod).
--  Los datos de prueba (usuarios, acuarios) viven en data.sql
--  y solo se cargan en entornos de desarrollo.
-- ============================================================

INSERT INTO species_catalog
    (id, common_name, scientific_name, category, reef_safe, image_url, notes)
VALUES
    (1, 'Pez Payaso',           'Amphiprion ocellaris',  'FISH',        TRUE,  NULL,
     'Especie icónica, ideal para principiantes. Convive perfectamente con anémonas del género Heteractis. Dificultad: Baja.'),

    (2, 'Cirujano Amarillo',    'Zebrasoma flavescens',  'FISH',        TRUE,  NULL,
     'Excelente ramoneador de algas filamentosas. Requiere espacio de nado libre; mínimo recomendado 300 L. Dificultad: Media.'),

    (3, 'Pez León',             'Pterois volitans',      'FISH',        FALSE, NULL,
     'Espinas con veneno hemolítico. Depreda peces pequeños e invertebrados. No apto para acuarios mixtos con fauna pequeña. Dificultad: Alta.'),

    (4, 'Coral Cuero',          'Sarcophyton sp.',       'CORAL',       TRUE,  NULL,
     'Coral blando de cuidado sencillo. Tolera variaciones moderadas de parámetros y flujo bajo-medio. Ideal para empezar con corales. Dificultad: Baja.'),

    (5, 'Coral Cerebro Verde',  'Favites abdita',        'CORAL',       TRUE,  NULL,
     'Coral duro LPS de crecimiento lento. Requiere iluminación intensa (PAR > 150) y flujo medio. Sensible a cambios bruscos de parámetros. Dificultad: Media.'),

    (6, 'Camarón Limpiador',    'Lysmata amboinensis',   'INVERTEBRATE',TRUE,  NULL,
     'Establece estaciones de limpieza donde retira parásitos de otros peces. Muy beneficioso en cualquier arrecife. Dificultad: Baja.'),

    (7, 'Estrella de Mar Chocolate', 'Protoreaster nodosus', 'INVERTEBRATE', FALSE, NULL,
     'Aspecto espectacular pero consume corales, bivalvos y otros invertebrados. Solo apta en biotopo de peces sin invertebrados ni corales. Dificultad: Alta.')

ON CONFLICT (id) DO NOTHING;

-- Sincronizar la secuencia tras insertar con IDs explícitos
SELECT setval('species_catalog_id_seq', (SELECT MAX(id) FROM species_catalog));
