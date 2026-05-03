package com.thalassa.backend.controllers;

import com.thalassa.backend.dto.AuthRequest;
import com.thalassa.backend.dto.AuthResponse;
import com.thalassa.backend.dto.ForgotPasswordRequest;
import com.thalassa.backend.dto.RefreshTokenRequest;
import com.thalassa.backend.dto.RegisterRequest;
import com.thalassa.backend.dto.ResetPasswordRequest;
import com.thalassa.backend.dto.UserResponse;
import com.thalassa.backend.services.AuthService;
import com.thalassa.backend.services.PasswordResetService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final AuthService authService;
  private final PasswordResetService passwordResetService;

  public AuthController(AuthService authService, PasswordResetService passwordResetService) {
    this.authService = authService;
    this.passwordResetService = passwordResetService;
  }

  /** POST /api/auth/register — crea la cuenta (sin JWT). */
  @PostMapping("/register")
  public ResponseEntity<UserResponse> register(@RequestBody RegisterRequest request) {
    UserResponse response = authService.register(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  /** POST /api/auth/login — devuelve access token (15 min) + refresh token (30 días). */
  @PostMapping("/login")
  public ResponseEntity<AuthResponse> login(
      @RequestBody AuthRequest request, HttpServletRequest httpRequest) {
    String userAgent = httpRequest.getHeader("User-Agent");
    String ip = httpRequest.getRemoteAddr();
    AuthResponse response = authService.login(request, userAgent, ip);
    return ResponseEntity.ok(response);
  }

  /** POST /api/auth/refresh — rota el refresh token y emite nuevos tokens. */
  @PostMapping("/refresh")
  public ResponseEntity<AuthResponse> refresh(
      @RequestBody RefreshTokenRequest request, HttpServletRequest httpRequest) {
    String userAgent = httpRequest.getHeader("User-Agent");
    String ip = httpRequest.getRemoteAddr();
    AuthResponse response = authService.refresh(request.getRefreshToken(), userAgent, ip);
    return ResponseEntity.ok(response);
  }

  /** POST /api/auth/logout — revoca el refresh token. Idempotente. */
  @PostMapping("/logout")
  public ResponseEntity<Void> logout(@RequestBody RefreshTokenRequest request) {
    authService.logout(request.getRefreshToken());
    return ResponseEntity.noContent().build();
  }

  /**
   * POST /api/auth/forgot-password Siempre devuelve 204 — no revela si el email está registrado.
   */
  @PostMapping("/forgot-password")
  public ResponseEntity<Void> forgotPassword(@RequestBody ForgotPasswordRequest request) {
    passwordResetService.requestReset(request.getEmail());
    return ResponseEntity.noContent().build();
  }

  /**
   * POST /api/auth/reset-password Valida el token, actualiza la contraseña y revoca todos los
   * refresh tokens del usuario.
   */
  @PostMapping("/reset-password")
  public ResponseEntity<Void> resetPassword(@RequestBody ResetPasswordRequest request) {
    passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
    return ResponseEntity.noContent().build();
  }
}
