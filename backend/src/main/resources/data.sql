-- ============================================================
--  Thalassa — Seed de datos de DESARROLLO (solo entorno dev)
--
--  Solo se ejecuta cuando spring.sql.init.mode=always (perfil dev).
--  El schema y los datos de referencia (species_catalog) son
--  gestionados por Flyway: V1__init_schema.sql y V2__seed_reference_data.sql.
--
--  Contraseña de TODOS los usuarios de prueba: 123456
--  Hash BCrypt generado con BCryptPasswordEncoder (cost 10)
--
--  Orden de inserción (respeta Foreign Keys):
--    1. users
--    2. aquariums      → FK users.id
--    3. livestock      → FK aquariums.id + species_catalog.id
--    4. equipment      → FK aquariums.id
-- ============================================================

-- ── 1. Usuarios de prueba ─────────────────────────────────────────────────────
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


-- ── 2. Acuarios de prueba ─────────────────────────────────────────────────────
INSERT INTO aquariums
    (id, name, liters, type, user_id)
VALUES
    (1, 'Mi Primer Acuario', 60,  'FISH_ONLY', 1),
    (2, 'Arrecife Elena',    500, 'REEF',      2)
ON CONFLICT (id) DO NOTHING;


-- ── 3. Fauna (Livestock) de prueba ────────────────────────────────────────────
INSERT INTO livestock
    (id, name, category, reef_safe, quantity, aquarium_id, species_catalog_id)
VALUES
    (1, 'Nemo y Marlin',   'FISH',        TRUE, 2, 1, 1),
    (2, 'Dory',            'FISH',        TRUE, 1, 1, 2),
    (3, 'Coral Cuero',     'CORAL',       TRUE, 1, 2, 4),
    (4, 'Coral Cerebro',   'CORAL',       TRUE, 1, 2, 5),
    (5, 'Equipo limpieza', 'INVERTEBRATE',TRUE, 3, 2, 6)
ON CONFLICT (id) DO NOTHING;


-- ── 4. Equipamiento de prueba ─────────────────────────────────────────────────
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


-- ── 5. Sincronización de secuencias ──────────────────────────────────────────
-- Necesario tras insertar registros con IDs explícitos para que los nuevos
-- registros no colisionen con los ya existentes.
SELECT setval('users_id_seq',           (SELECT MAX(id) FROM users));
SELECT setval('aquariums_id_seq',       (SELECT MAX(id) FROM aquariums));
SELECT setval('livestock_id_seq',       (SELECT MAX(id) FROM livestock));
SELECT setval('equipment_id_seq',       (SELECT MAX(id) FROM equipment));
