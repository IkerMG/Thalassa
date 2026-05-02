package com.thalassa.backend.controllers;

import com.thalassa.backend.dto.ErrorResponse;
import com.thalassa.backend.exceptions.AccessDeniedException;
import com.thalassa.backend.exceptions.InvalidRefreshTokenException;
import com.thalassa.backend.exceptions.InvalidTokenException;
import com.thalassa.backend.exceptions.RateLimitExceededException;
import com.thalassa.backend.exceptions.ResourceNotFoundException;
import java.time.LocalDateTime;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  // ── Helper ────────────────────────────────────────────────────────────────

  /**
   * Construye un ErrorResponse usando la API fluida generada por OpenAPI Generator. ErrorResponse
   * es un DTO generado: no tiene métodos estáticos de fábrica.
   */
  private ErrorResponse error(String message) {
    return ErrorResponse.builder().message(message).timestamp(LocalDateTime.now()).build();
  }

  // ── Handlers ──────────────────────────────────────────────────────────────

  /** Email o username ya registrados → 409 Conflict */
  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
    return ResponseEntity.status(HttpStatus.CONFLICT).body(error(ex.getMessage()));
  }

  /** Credenciales incorrectas en el login → 401 Unauthorized */
  @ExceptionHandler(AuthenticationException.class)
  public ResponseEntity<ErrorResponse> handleAuthentication(AuthenticationException ex) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error("Credenciales incorrectas."));
  }

  /** Refresh token inválido, expirado o ya usado → 401 Unauthorized */
  @ExceptionHandler(InvalidRefreshTokenException.class)
  public ResponseEntity<ErrorResponse> handleInvalidRefreshToken(InvalidRefreshTokenException ex) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error(ex.getMessage()));
  }

  /** Token de reseteo de contraseña inválido, expirado o ya usado → 400 Bad Request */
  @ExceptionHandler(InvalidTokenException.class)
  public ResponseEntity<ErrorResponse> handleInvalidToken(InvalidTokenException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error(ex.getMessage()));
  }

  /** Recurso no encontrado o no pertenece al usuario autenticado → 404 Not Found */
  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error(ex.getMessage()));
  }

  /**
   * Acceso denegado por reglas de negocio (límite freemium, funcionalidad premium) → 403 Forbidden
   */
  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error(ex.getMessage()));
  }

  /** Límite de tasa superado (ej. chat diario FREE) → 429 Too Many Requests */
  @ExceptionHandler(RateLimitExceededException.class)
  public ResponseEntity<ErrorResponse> handleRateLimit(RateLimitExceededException ex) {
    return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(error(ex.getMessage()));
  }

  /**
   * Precondición de negocio no satisfecha (ej. precio kWh no configurado) → 422 Unprocessable
   * Entity
   */
  @ExceptionHandler(IllegalStateException.class)
  public ResponseEntity<ErrorResponse> handleIllegalState(IllegalStateException ex) {
    return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(error(ex.getMessage()));
  }

  /** Fallo de validación de Bean Validation (@Valid) → 400 Bad Request */
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
    String message =
        ex.getBindingResult().getFieldErrors().stream()
            .findFirst()
            .map(FieldError::getDefaultMessage)
            .orElse("Datos de entrada inválidos.");
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error(message));
  }
}
