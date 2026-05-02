package com.thalassa.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.function.Function;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

  private final String secret;
  private final long accessExpirationMs;

  public JwtUtil(
      @Value("${jwt.secret}") String secret,
      @Value("${app.jwt.access-expiration-ms}") long accessExpirationMs) {
    this.secret = secret;
    this.accessExpirationMs = accessExpirationMs;
  }

  // ── Generación ────────────────────────────────────────────────────────────

  public String generateAccessToken(UserDetails userDetails) {
    return Jwts.builder()
        .subject(userDetails.getUsername())
        .issuedAt(new Date())
        .expiration(new Date(System.currentTimeMillis() + accessExpirationMs))
        .signWith(getSigningKey())
        .compact();
  }

  // ── Extracción ────────────────────────────────────────────────────────────

  public String extractEmail(String token) {
    return extractClaim(token, Claims::getSubject);
  }

  public <T> T extractClaim(String token, Function<Claims, T> resolver) {
    return resolver.apply(extractAllClaims(token));
  }

  // ── Validación ────────────────────────────────────────────────────────────

  public boolean isTokenValid(String token, UserDetails userDetails) {
    final String email = extractEmail(token);
    return email.equals(userDetails.getUsername()) && !isTokenExpired(token);
  }

  // ── Privados ──────────────────────────────────────────────────────────────

  private Claims extractAllClaims(String token) {
    return Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload();
  }

  private boolean isTokenExpired(String token) {
    return extractClaim(token, Claims::getExpiration).before(new Date());
  }

  private SecretKey getSigningKey() {
    byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
    return Keys.hmacShaKeyFor(keyBytes);
  }
}
