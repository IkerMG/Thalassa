package com.thalassa.backend.exceptions;

/**
 * Excepción de negocio para accesos denegados por reglas de la aplicación
 * (ej. límite de plan freemium, acceso a funcionalidad REEFMASTER).
 *
 * IMPORTANTE: No usar org.springframework.security.access.AccessDeniedException
 * ya que Spring Security intercepta esa clase antes de llegar al @RestControllerAdvice.
 */
public class AccessDeniedException extends RuntimeException {

    public AccessDeniedException(String message) {
        super(message);
    }
}
