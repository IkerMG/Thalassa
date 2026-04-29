-- ============================================================
--  Thalassa — V1: Schema inicial
--
--  DDL derivado de las entidades JPA.
--  Convenciones de nombres: Hibernate (snake_case, {tabla}_{col}_check).
--  Generado manualmente — equivale al output de pg_dump --schema-only
--  sobre un Hibernate ddl-auto:create en PostgreSQL 16.
-- ============================================================

-- ── 1. users ──────────────────────────────────────────────────────────────────

CREATE TABLE users (
    id                   BIGSERIAL PRIMARY KEY,
    username             VARCHAR(50)  NOT NULL,
    email                VARCHAR(100) NOT NULL,
    password             VARCHAR(255) NOT NULL,
    subscription_plan    VARCHAR(255) NOT NULL DEFAULT 'FREE',
    electricity_price_kwh DOUBLE PRECISION,
    locale               VARCHAR(5)  DEFAULT 'en',
    temperature_unit     VARCHAR(1)  DEFAULT 'C',
    volume_unit          VARCHAR(3)  DEFAULT 'L',
    chat_count_today     INTEGER     NOT NULL DEFAULT 0,
    last_chat_date       DATE,

    CONSTRAINT users_username_key  UNIQUE (username),
    CONSTRAINT users_email_key     UNIQUE (email),
    CONSTRAINT users_subscription_plan_check
        CHECK (subscription_plan IN ('FREE', 'REEFMASTER'))
);

-- ── 2. aquariums ──────────────────────────────────────────────────────────────

CREATE TABLE aquariums (
    id      BIGSERIAL PRIMARY KEY,
    name    VARCHAR(100) NOT NULL,
    liters  INTEGER      NOT NULL,
    type    VARCHAR(255) NOT NULL,
    user_id BIGINT       NOT NULL,

    CONSTRAINT fk_aquariums_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT aquariums_type_check
        CHECK (type IN ('REEF', 'FISH_ONLY', 'MIXED'))
);

-- ── 3. species_catalog ────────────────────────────────────────────────────────

CREATE TABLE species_catalog (
    id              BIGSERIAL PRIMARY KEY,
    common_name     VARCHAR(100)  NOT NULL,
    scientific_name VARCHAR(150)  NOT NULL,
    category        VARCHAR(255)  NOT NULL,
    reef_safe       BOOLEAN       NOT NULL,
    image_url       VARCHAR(500),
    notes           VARCHAR(1000),

    CONSTRAINT species_catalog_category_check
        CHECK (category IN ('FISH', 'CORAL', 'INVERTEBRATE'))
);

-- ── 4. livestock ──────────────────────────────────────────────────────────────

CREATE TABLE livestock (
    id                 BIGSERIAL PRIMARY KEY,
    name               VARCHAR(100) NOT NULL,
    category           VARCHAR(255) NOT NULL,
    reef_safe          BOOLEAN      NOT NULL,
    quantity           INTEGER      NOT NULL DEFAULT 1,
    aquarium_id        BIGINT       NOT NULL,
    species_catalog_id BIGINT,

    CONSTRAINT fk_livestock_aquarium       FOREIGN KEY (aquarium_id)        REFERENCES aquariums (id),
    CONSTRAINT fk_livestock_species_catalog FOREIGN KEY (species_catalog_id) REFERENCES species_catalog (id),
    CONSTRAINT livestock_category_check
        CHECK (category IN ('FISH', 'CORAL', 'INVERTEBRATE'))
);

-- ── 5. equipment ──────────────────────────────────────────────────────────────

CREATE TABLE equipment (
    id           BIGSERIAL PRIMARY KEY,
    name         VARCHAR(100)      NOT NULL,
    power_watts  INTEGER           NOT NULL,
    hours_per_day DOUBLE PRECISION NOT NULL,
    category     VARCHAR(255),
    aquarium_id  BIGINT            NOT NULL,

    CONSTRAINT fk_equipment_aquarium FOREIGN KEY (aquarium_id) REFERENCES aquariums (id),
    CONSTRAINT equipment_category_check
        CHECK (category IN ('LIGHT', 'PUMP', 'SKIMMER', 'HEATER', 'OTHER'))
);

-- ── 6. water_parameters ───────────────────────────────────────────────────────

CREATE TABLE water_parameters (
    id              BIGSERIAL PRIMARY KEY,
    aquarium_id     BIGINT           NOT NULL,
    temperature     DOUBLE PRECISION,
    salinity        DOUBLE PRECISION,
    ph              DOUBLE PRECISION,
    alkalinity_dkh  DOUBLE PRECISION,
    calcium_ppm     DOUBLE PRECISION,
    magnesium_ppm   DOUBLE PRECISION,
    nitrates_ppm    DOUBLE PRECISION,
    phosphates_ppm  DOUBLE PRECISION,
    measured_at     TIMESTAMP        NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_water_parameters_aquarium FOREIGN KEY (aquarium_id) REFERENCES aquariums (id)
);

-- ── 7. wishlist ───────────────────────────────────────────────────────────────

CREATE TABLE wishlist (
    id           BIGSERIAL PRIMARY KEY,
    product_name VARCHAR(200) NOT NULL,
    price        DOUBLE PRECISION NOT NULL,
    img_url      VARCHAR(500),
    product_url  VARCHAR(500) NOT NULL,
    store_name   VARCHAR(100) NOT NULL,
    category     VARCHAR(255),
    priority     VARCHAR(255) DEFAULT 'MEDIUM',
    notes        VARCHAR(500),
    user_id      BIGINT       NOT NULL,

    CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT wishlist_category_check
        CHECK (category IN ('EQUIPMENT', 'LIVESTOCK', 'SUPPLEMENT', 'OTHER')),
    CONSTRAINT wishlist_priority_check
        CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH'))
);
