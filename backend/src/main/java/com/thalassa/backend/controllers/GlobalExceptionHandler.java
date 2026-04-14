package com.thalassa.backend.controllers;

import com.thalassa.backend.dto.ErrorResponse;
import com.thalassa.backend.exceptions.AccessDeniedException;
import com.thalassa.backend.exceptions.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ── Helper ────────────────────────────────────────────────────────────────

    /**
     * Construye un ErrorResponse usando la API fluida generada por OpenAPI Generator.
     * ErrorResponse es un DTO generado: no tiene métodos estáticos de fábrica.
     */
    private ErrorResponse error(String message) {
        return ErrorResponse.builder()
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
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

    /** Recurso no encontrado o no pertenece al usuario autenticado → 404 Not Found */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error(ex.getMessage()));
    }

    /** Acceso denegado por reglas de negocio (límite freemium, funcionalidad premium) → 403 Forbidden */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error(ex.getMessage()));
    }

    /** Precondición de negocio no satisfecha (ej. precio kWh no configurado) → 422 Unprocessable Entity */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalState(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(error(ex.getMessage()));
    }

    /** Fallo de validación de Bean Validation (@Valid) → 400 Bad Request */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(FieldError::getDefaultMessage)
                .orElse("Datos de entrada inválidos.");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error(message));
    }
}
