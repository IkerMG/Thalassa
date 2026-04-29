package com.thalassa.backend.services;

import com.thalassa.backend.dto.AuthRequest;
import com.thalassa.backend.dto.AuthResponse;
import com.thalassa.backend.dto.RegisterRequest;
import com.thalassa.backend.dto.UserResponse;
import com.thalassa.backend.models.SubscriptionPlan;
import com.thalassa.backend.models.User;
import com.thalassa.backend.repositories.UserRepository;
import com.thalassa.backend.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            AuthenticationManager authenticationManager,
            RefreshTokenService refreshTokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.refreshTokenService = refreshTokenService;
    }

    /**
     * Registra un nuevo usuario con plan FREE y contraseña cifrada con BCrypt.
     * No genera JWT: el cliente debe llamar a /login tras el registro.
     *
     * @throws IllegalArgumentException si el email o username ya están en uso.
     */
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("El email ya está registrado.");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("El nombre de usuario ya está en uso.");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .subscriptionPlan(SubscriptionPlan.FREE)
                .build();

        User saved = userRepository.save(user);

        return UserResponse.builder()
                .id(saved.getId())
                .username(saved.getDisplayUsername())
                .email(saved.getEmail())
                .subscriptionPlan(saved.getSubscriptionPlan())
                .build();
    }

    /**
     * Autentica al usuario y devuelve un access token (15 min) y un refresh token (30 días).
     *
     * @throws org.springframework.security.core.AuthenticationException si las credenciales son incorrectas.
     */
    @Transactional
    public AuthResponse login(AuthRequest request, String userAgent, String ip) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado."));

        String accessToken = jwtUtil.generateAccessToken(user);
        String refreshToken = refreshTokenService.generateRefreshToken(user, userAgent, ip);

        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .username(user.getDisplayUsername())
                .email(user.getEmail())
                .subscriptionPlan(user.getSubscriptionPlan())
                .build();
    }

    /**
     * Rota el refresh token y emite un nuevo access token + nuevo refresh token.
     *
     * @throws com.thalassa.backend.exceptions.InvalidRefreshTokenException si el token no es válido.
     */
    @Transactional
    public AuthResponse refresh(String plainToken, String userAgent, String ip) {
        RefreshTokenService.RotationResult result = refreshTokenService.validateAndRotate(plainToken, userAgent, ip);
        String newAccessToken = jwtUtil.generateAccessToken(result.user());

        return AuthResponse.builder()
                .token(newAccessToken)
                .refreshToken(result.newToken())
                .username(result.user().getDisplayUsername())
                .email(result.user().getEmail())
                .subscriptionPlan(result.user().getSubscriptionPlan())
                .build();
    }

    /** Revoca el refresh token. Idempotente. */
    public void logout(String plainToken) {
        refreshTokenService.revoke(plainToken);
    }
}
