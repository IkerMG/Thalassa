-- ============================================================
--  Thalassa – Seed de datos de prueba
--  Contraseña de TODOS los usuarios: 123456
--  Hash BCrypt generado con BCryptPasswordEncoder (cost 10)
--
--  Se usa INSERT ... ON CONFLICT (id) DO NOTHING para que el
--  script sea idempotente: puede ejecutarse en cada arranque
--  sin duplicar registros. Sintaxis compatible con PostgreSQL.
--
--  Orden de inserción (respeta Foreign Keys):
--    1. users
--    2. species_catalog
--    3. aquariums      → FK users.id
--    4. livestock      → FK aquariums.id + species_catalog.id
--    5. equipment      → FK aquariums.id
-- ============================================================

-- ── 1. Usuarios ───────────────────────────────────────────────────────────────
--  marc  → plan FREE  · sin precio de electricidad configurado
--  elena → plan REEFMASTER · tiene precio kWh configurado para la calculadora
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO users
    (id, username, email, password, subscription_plan, electricity_price_kwh,
     chat_count_today, last_chat_date)
VALUES
    (1, 'marc',  'marc@thalassa.com',
     '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBpwTTyU3zwOWW',
     'FREE', NULL, 0, NULL),

    (2, 'elena', 'elena@thalassa.com',
     '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBpwTTyU3zwOWW',
     'REEFMASTER', 0.15, 0, NULL)
ON CONFLICT (id) DO NOTHING;


-- ── 2. Catálogo de Especies ───────────────────────────────────────────────────
INSERT INTO species_catalog
    (id, common_name, scientific_name, category, reef_safe, image_url, notes)
VALUES
    (1,
     'Pez Payaso',
     'Amphiprion ocellaris',
     'PEZ', TRUE, NULL,
     'Especie icónica, ideal para principiantes. Convive perfectamente con anémonas del género Heteractis. Dificultad: Baja.'),

    (2,
     'Cirujano Amarillo',
     'Zebrasoma flavescens',
     'PEZ', TRUE, NULL,
     'Excelente ramoneador de algas filamentosas. Requiere espacio de nado libre; mínimo recomendado 300 L. Dificultad: Media.'),

    (3,
     'Pez León',
     'Pterois volitans',
     'PEZ', FALSE, NULL,
     'Espinas con veneno hemolítico. Depreda peces pequeños e invertebrados. No apto para acuarios mixtos con fauna pequeña. Dificultad: Alta.'),

    (4,
     'Coral Cuero',
     'Sarcophyton sp.',
     'CORAL', TRUE, NULL,
     'Coral blando de cuidado sencillo. Tolera variaciones moderadas de parámetros y flujo bajo-medio. Ideal para empezar con corales. Dificultad: Baja.'),

    (5,
     'Coral Cerebro Verde',
     'Favites abdita',
     'CORAL', TRUE, NULL,
     'Coral duro LPS de crecimiento lento. Requiere iluminación intensa (PAR > 150) y flujo medio. Sensible a cambios bruscos de parámetros. Dificultad: Media.'),

    (6,
     'Camarón Limpiador',
     'Lysmata amboinensis',
     'INVERTEBRADO', TRUE, NULL,
     'Establece estaciones de limpieza donde retira parásitos de otros peces. Muy beneficioso en cualquier arrecife. Dificultad: Baja.'),

    (7,
     'Estrella de Mar Chocolate',
     'Protoreaster nodosus',
     'INVERTEBRADO', FALSE, NULL,
     'Aspecto espectacular pero consume corales, bivalvos y otros invertebrados. Solo apta en biotopo de peces sin invertebrados ni corales. Dificultad: Alta.')
ON CONFLICT (id) DO NOTHING;


-- ── 3. Acuarios ──────────────────────────────────────────────────────────────
INSERT INTO aquariums
    (id, name, liters, type, user_id)
VALUES
    (1, 'Mi Primer Acuario', 60,  'MARINO_PECES',   1),
    (2, 'Arrecife Elena',    500, 'MARINO_ARRECIFE', 2)
ON CONFLICT (id) DO NOTHING;


-- ── 4. Fauna (Livestock) ─────────────────────────────────────────────────────
INSERT INTO livestock
    (id, name, category, reef_safe, quantity, aquarium_id, species_catalog_id)
VALUES
    (1, 'Nemo y Marlin',  'PEZ', TRUE, 2, 1, 1),
    (2, 'Dory',           'PEZ', TRUE, 1, 1, 2),
    (3, 'Coral Cuero',    'CORAL',        TRUE, 1, 2, 4),
    (4, 'Coral Cerebro',  'CORAL',        TRUE, 1, 2, 5),
    (5, 'Equipo limpieza','INVERTEBRADO', TRUE, 3, 2, 6)
ON CONFLICT (id) DO NOTHING;


-- ── 5. Equipamiento ──────────────────────────────────────────────────────────
INSERT INTO equipment
    (id, name, power_watts, hours_per_day, aquarium_id)
VALUES
    (1, 'Iluminación LED 60 L',  30,  10.0, 1),
    (2, 'Filtro interior',       15,  24.0, 1),
    (3, 'Iluminación LED 500 L', 200, 12.0, 2),
    (4, 'Skimmer de proteínas',   80, 24.0, 2),
    (5, 'Bomba de circulación',   40, 24.0, 2),
    (6, 'Calentador 300 W',      300,  8.0, 2)
ON CONFLICT (id) DO NOTHING;
