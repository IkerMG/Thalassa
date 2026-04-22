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

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
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
     * Autentica al usuario con email y contraseña.
     *
     * @throws org.springframework.security.core.AuthenticationException si las credenciales son incorrectas.
     */
    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado."));

        String token = jwtUtil.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .username(user.getDisplayUsername())
                .email(user.getEmail())
                .subscriptionPlan(user.getSubscriptionPlan())
                .build();
    }
}
