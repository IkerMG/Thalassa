-- ============================================================
--  Thalassa — V4: Tokens de reseteo de contraseña
--
--  Seguridad:
--  - token_hash: SHA-256 del token en claro (nunca el token plano)
--  - used_at: marca el token como consumido (uso único)
--  - expires_at: TTL de 1 hora
-- ============================================================

CREATE TABLE password_reset_tokens (
    id          BIGSERIAL    PRIMARY KEY,
    user_id     BIGINT       NOT NULL,
    token_hash  VARCHAR(64)  NOT NULL,
    expires_at  TIMESTAMPTZ  NOT NULL,
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_prt_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT uq_prt_hash
        UNIQUE (token_hash)
);

CREATE INDEX idx_prt_user ON password_reset_tokens (user_id);
