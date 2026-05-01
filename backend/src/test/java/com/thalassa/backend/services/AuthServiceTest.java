package com.thalassa.backend.services;

import com.thalassa.backend.dto.AuthRequest;
import com.thalassa.backend.dto.AuthResponse;
import com.thalassa.backend.dto.RegisterRequest;
import com.thalassa.backend.dto.UserResponse;
import com.thalassa.backend.models.SubscriptionPlan;
import com.thalassa.backend.models.User;
import com.thalassa.backend.repositories.UserRepository;
import com.thalassa.backend.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtUtil jwtUtil;
    @Mock AuthenticationManager authenticationManager;
    @Mock RefreshTokenService refreshTokenService;

    @InjectMocks AuthService authService;

    // ── register ──────────────────────────────────────────────────────────────

    @Test
    void register_ok() {
        RegisterRequest req = RegisterRequest.builder()
                .email("user@test.com").username("testuser").password("secret123").build();

        when(userRepository.existsByEmail("user@test.com")).thenReturn(false);
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("hashed");

        User saved = User.builder()
                .id(1L).username("testuser").email("user@test.com")
                .password("hashed").subscriptionPlan(SubscriptionPlan.FREE).build();
        when(userRepository.save(any(User.class))).thenReturn(saved);

        UserResponse result = authService.register(req);

        assertThat(result.getEmail()).isEqualTo("user@test.com");
        assertThat(result.getSubscriptionPlan()).isEqualTo(SubscriptionPlan.FREE);
    }

    @Test
    void register_duplicateEmail_throwsIllegalArgument() {
        RegisterRequest req = RegisterRequest.builder()
                .email("dup@test.com").username("user").password("pass").build();
        when(userRepository.existsByEmail("dup@test.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("email");
    }

    @Test
    void register_duplicateUsername_throwsIllegalArgument() {
        RegisterRequest req = RegisterRequest.builder()
                .email("new@test.com").username("taken").password("pass").build();
        when(userRepository.existsByEmail("new@test.com")).thenReturn(false);
        when(userRepository.existsByUsername("taken")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("usuario");
    }

    // ── login ─────────────────────────────────────────────────────────────────

    @Test
    void login_ok() {
        AuthRequest req = AuthRequest.builder().email("user@test.com").password("secret123").build();

        User user = User.builder()
                .id(1L).username("testuser").email("user@test.com")
                .password("hashed").subscriptionPlan(SubscriptionPlan.FREE).build();

        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(jwtUtil.generateAccessToken(user)).thenReturn("access-token");
        when(refreshTokenService.generateRefreshToken(eq(user), any(), any())).thenReturn("refresh-token");

        AuthResponse result = authService.login(req, "Mozilla", "127.0.0.1");

        assertThat(result.getToken()).isEqualTo("access-token");
        assertThat(result.getRefreshToken()).isEqualTo("refresh-token");
        assertThat(result.getEmail()).isEqualTo("user@test.com");
    }

    @Test
    void login_badCredentials_throws() {
        AuthRequest req = AuthRequest.builder().email("user@test.com").password("wrong").build();

        doThrow(new BadCredentialsException("bad credentials"))
                .when(authenticationManager)
                .authenticate(any(UsernamePasswordAuthenticationToken.class));

        assertThatThrownBy(() -> authService.login(req, null, null))
                .isInstanceOf(BadCredentialsException.class);
    }
}
