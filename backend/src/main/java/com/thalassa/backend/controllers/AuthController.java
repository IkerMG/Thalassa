package com.thalassa.backend.controllers;

import com.thalassa.backend.dto.AuthRequest;
import com.thalassa.backend.dto.AuthResponse;
import com.thalassa.backend.dto.ErrorResponse;
import com.thalassa.backend.dto.RegisterRequest;
import com.thalassa.backend.dto.UserResponse;
import com.thalassa.backend.services.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * POST /api/auth/register
     * Crea la cuenta y devuelve los datos del usuario (sin JWT).
     * El cliente debe llamar a POST /api/auth/login para obtener el token.
     */
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody RegisterRequest request) {
        UserResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * POST /api/auth/login
     * Autentica con email + contraseña y devuelve el JWT.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
