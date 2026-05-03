package com.thalassa.backend.services;

import com.thalassa.backend.exceptions.InvalidTokenException;
import com.thalassa.backend.models.PasswordResetToken;
import com.thalassa.backend.repositories.PasswordResetTokenRepository;
import com.thalassa.backend.repositories.UserRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
public class PasswordResetService {

  private static final long RESET_TTL_HOURS = 1L;

  private final PasswordResetTokenRepository tokenRepository;
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final EmailService emailService;
  private final RefreshTokenService refreshTokenService;

  public PasswordResetService(
      PasswordResetTokenRepository tokenRepository,
      UserRepository userRepository,
      PasswordEncoder passwordEncoder,
      EmailService emailService,
      RefreshTokenService refreshTokenService) {
    this.tokenRepository = tokenRepository;
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.emailService = emailService;
    this.refreshTokenService = refreshTokenService;
  }

  /**
   * Genera un token de reseteo y lo envía por email. Si el email no existe, retorna silenciosamente
   * (no revelar si el email está registrado).
   */
  @Transactional
  public void requestReset(String email) {
    userRepository
        .findByEmail(email)
        .ifPresent(
            user -> {
              String plainToken = UUID.randomUUID().toString();

              PasswordResetToken token =
                  PasswordResetToken.builder()
                      .user(user)
                      .tokenHash(hash(plainToken))
                      .expiresAt(Instant.now().plus(RESET_TTL_HOURS, ChronoUnit.HOURS))
                      .build();

              tokenRepository.save(token);
              emailService.sendPasswordResetEmail(email, plainToken);
            });
  }

  /**
   * Valida el token, actualiza la contraseña y revoca todos los refresh tokens del usuario para
   * forzar re-login en todos los dispositivos.
   *
   * @throws InvalidTokenException si el token no existe, ya fue usado o ha expirado.
   */
  @Transactional
  public void resetPassword(String plainToken, String newPassword) {
    String tokenHash = hash(plainToken);

    PasswordResetToken token =
        tokenRepository
            .findByTokenHash(tokenHash)
            .orElseThrow(() -> new InvalidTokenException("Token de reseteo inválido."));

    if (token.getUsedAt() != null) {
      throw new InvalidTokenException("El token ya ha sido utilizado.");
    }
    if (token.getExpiresAt().isBefore(Instant.now())) {
      throw new InvalidTokenException("El token de reseteo ha expirado.");
    }

    token.getUser().setPassword(passwordEncoder.encode(newPassword));
    userRepository.save(token.getUser());

    token.setUsedAt(Instant.now());
    tokenRepository.save(token);

    // Revocar todos los refresh tokens activos — fuerza re-login en todos los dispositivos
    refreshTokenService.revokeAllForUser(token.getUser());
    log.info("Password reset completed for user {}", token.getUser().getId());
  }

  private String hash(String token) {
    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      byte[] bytes = digest.digest(token.getBytes(StandardCharsets.UTF_8));
      return HexFormat.of().formatHex(bytes);
    } catch (NoSuchAlgorithmException e) {
      throw new IllegalStateException("SHA-256 unavailable", e);
    }
  }
}
