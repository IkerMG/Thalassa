package com.thalassa.backend.services;

import com.thalassa.backend.exceptions.InvalidRefreshTokenException;
import com.thalassa.backend.models.RefreshToken;
import com.thalassa.backend.models.User;
import com.thalassa.backend.repositories.RefreshTokenRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final long refreshExpirationMs;

    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository,
            @Value("${app.jwt.refresh-expiration-ms}") long refreshExpirationMs) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    // ── Generación ────────────────────────────────────────────────────────────

    /**
     * Genera un nuevo refresh token opaco (UUID v4), guarda su hash SHA-256
     * en BD y retorna el token en claro (solo se muestra una vez al cliente).
     */
    @Transactional
    public String generateRefreshToken(User user, String userAgent, String ip) {
        String plainToken = UUID.randomUUID().toString();

        RefreshToken entity = RefreshToken.builder()
                .user(user)
                .tokenHash(hash(plainToken))
                .expiresAt(Instant.now().plusMillis(refreshExpirationMs))
                .userAgent(truncate(userAgent, 255))
                .ip(ip)
                .build();

        refreshTokenRepository.save(entity);
        return plainToken;
    }

    // ── Validación y rotación ─────────────────────────────────────────────────

    /**
     * Resultado de una rotación exitosa.
     *
     * @param newToken el token en claro que debe enviarse al cliente
     * @param user     el usuario propietario
     */
    public record RotationResult(String newToken, User user) {}

    /**
     * Valida el token recibido, revoca el actual y emite uno nuevo.
     * Si el token ya estaba revocado (reuse), invalida toda la familia
     * del usuario como medida de defensa ante robo.
     *
     * @throws InvalidRefreshTokenException si el token no existe, está revocado o ha expirado
     */
    @Transactional
    public RotationResult validateAndRotate(String plainToken, String userAgent, String ip) {
        String tokenHash = hash(plainToken);

        RefreshToken existing = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new InvalidRefreshTokenException("Refresh token inválido"));

        if (existing.getRevokedAt() != null) {
            revokeAllForUser(existing.getUser());
            log.warn("SECURITY: Refresh token reuse detected for user {}", existing.getUser().getId());
            throw new InvalidRefreshTokenException("Refresh token ya utilizado — posible robo detectado");
        }

        if (existing.getExpiresAt().isBefore(Instant.now())) {
            throw new InvalidRefreshTokenException("Refresh token expirado");
        }

        // Revocar el token actual
        existing.setRevokedAt(Instant.now());

        // Crear el token de reemplazo
        String newPlainToken = UUID.randomUUID().toString();
        RefreshToken replacement = RefreshToken.builder()
                .user(existing.getUser())
                .tokenHash(hash(newPlainToken))
                .expiresAt(Instant.now().plusMillis(refreshExpirationMs))
                .userAgent(truncate(userAgent, 255))
                .ip(ip)
                .build();

        RefreshToken saved = refreshTokenRepository.save(replacement);

        // Enlazar cadena de auditoría
        existing.setReplacedBy(saved);
        refreshTokenRepository.save(existing);

        return new RotationResult(newPlainToken, existing.getUser());
    }

    // ── Revocación ────────────────────────────────────────────────────────────

    /** Revoca un token por su valor en claro. Idempotente. */
    @Transactional
    public void revoke(String plainToken) {
        String tokenHash = hash(plainToken);
        refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(t -> {
            if (t.getRevokedAt() == null) {
                t.setRevokedAt(Instant.now());
                refreshTokenRepository.save(t);
            }
        });
    }

    /** Revoca todos los refresh tokens activos de un usuario (p.ej. tras reset de contraseña). */
    @Transactional
    public void revokeAllForUser(User user) {
        List<RefreshToken> active = refreshTokenRepository.findByUserIdAndRevokedAtIsNull(user.getId());
        Instant now = Instant.now();
        active.forEach(t -> t.setRevokedAt(now));
        refreshTokenRepository.saveAll(active);
    }

    // ── Limpieza periódica ─────────────────────────────────────────────────────

    /** Purga tokens expirados hace más de 90 días (cada noche a las 3:00). */
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void purgeExpiredTokens() {
        Instant cutoff = Instant.now().minus(90, ChronoUnit.DAYS);
        refreshTokenRepository.deleteExpiredBefore(cutoff);
        log.info("Purged refresh tokens expired before {}", cutoff);
    }

    // ── Utilidades privadas ───────────────────────────────────────────────────

    private String hash(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }

    private String truncate(String value, int maxLength) {
        if (value == null) return null;
        return value.length() <= maxLength ? value : value.substring(0, maxLength);
    }
}
