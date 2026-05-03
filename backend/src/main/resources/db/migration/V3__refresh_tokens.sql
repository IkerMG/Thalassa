-- ============================================================
--  Thalassa — V3: Tabla de refresh tokens rotativos
--
--  Diseño de seguridad:
--  - token_hash: SHA-256 del token en claro (nunca el token plano)
--  - replaced_by_id: cadena de auditoría de rotación
--  - Índice (user_id, revoked_at) para detección de reuse y cleanup
-- ============================================================

CREATE TABLE refresh_tokens (
    id              BIGSERIAL    PRIMARY KEY,
    user_id         BIGINT       NOT NULL,
    token_hash      VARCHAR(64)  NOT NULL,
    expires_at      TIMESTAMPTZ  NOT NULL,
    revoked_at      TIMESTAMPTZ,
    replaced_by_id  BIGINT,
    user_agent      VARCHAR(255),
    ip              VARCHAR(45),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_refresh_tokens_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_refresh_tokens_replaced_by
        FOREIGN KEY (replaced_by_id) REFERENCES refresh_tokens (id),
    CONSTRAINT uq_refresh_tokens_hash
        UNIQUE (token_hash)
);

CREATE INDEX idx_refresh_tokens_user_revoked ON refresh_tokens (user_id, revoked_at);
