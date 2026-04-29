package com.thalassa.backend.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(
    name = "refresh_tokens",
    indexes = {
        @Index(name = "idx_refresh_tokens_user_revoked", columnList = "user_id, revoked_at")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** SHA-256 del token en claro — nunca se almacena el token plano. */
    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    /** Nulo mientras el token es válido; relleno al rotarlo o revocarlo. */
    @Column(name = "revoked_at")
    private Instant revokedAt;

    /**
     * Enlaza el token actual con el siguiente de la cadena de rotación.
     * Permite revocar toda la familia si se detecta reutilización.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "replaced_by_id")
    private RefreshToken replacedBy;

    @Column(name = "user_agent", length = 255)
    private String userAgent;

    @Column(length = 45)
    private String ip;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
