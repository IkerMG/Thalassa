package com.thalassa.backend.controllers;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class AuthControllerIT {

    @Container
    static PostgreSQLContainer<?> postgres =
            new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
        registry.add("spring.jpa.properties.hibernate.dialect",
                () -> "org.hibernate.dialect.PostgreSQLDialect");
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "none");
        registry.add("spring.flyway.enabled", () -> "true");
        registry.add("spring.flyway.baseline-on-migrate", () -> "true");
        registry.add("jwt.secret",
                () -> "test-secret-key-minimum-256-bits-long-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
        registry.add("app.jwt.access-expiration-ms", () -> "900000");
        registry.add("app.jwt.refresh-expiration-ms", () -> "2592000000");
        registry.add("python.service.url", () -> "http://localhost:8001");
        registry.add("chat.free-daily-limit", () -> "5");
    }

    @Autowired
    TestRestTemplate restTemplate;

    // ── /register ────────────────────────────────────────────────────────────

    @Test
    void register_validRequest_returns201() {
        String unique = UUID.randomUUID().toString().substring(0, 8);
        Map<String, String> body = Map.of(
                "email", unique + "@test.com",
                "username", "user_" + unique,
                "password", "password123"
        );

        ResponseEntity<Map> response = restTemplate.postForEntity(
                "/api/auth/register", body, Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).containsKey("email");
    }

    @Test
    void register_duplicateEmail_returns400() {
        String unique = UUID.randomUUID().toString().substring(0, 8);
        Map<String, String> body = Map.of(
                "email", unique + "@test.com",
                "username", "user_" + unique,
                "password", "password123"
        );

        restTemplate.postForEntity("/api/auth/register", body, Map.class);
        // Second registration with same email
        Map<String, String> dup = Map.of(
                "email", unique + "@test.com",
                "username", "other_" + unique,
                "password", "password123"
        );
        ResponseEntity<Map> second = restTemplate.postForEntity(
                "/api/auth/register", dup, Map.class);

        assertThat(second.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    // ── /login ────────────────────────────────────────────────────────────────

    @Test
    void login_validCredentials_returns200WithToken() {
        String unique = UUID.randomUUID().toString().substring(0, 8);
        String email = unique + "@test.com";

        // Register first
        restTemplate.postForEntity("/api/auth/register", Map.of(
                "email", email,
                "username", "user_" + unique,
                "password", "password123"
        ), Map.class);

        // Then login
        ResponseEntity<Map> response = restTemplate.postForEntity(
                "/api/auth/login",
                Map.of("email", email, "password", "password123"),
                Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsKey("token");
        assertThat(response.getBody()).containsKey("refreshToken");
    }

    @Test
    void login_wrongPassword_returns401() {
        String unique = UUID.randomUUID().toString().substring(0, 8);
        String email = unique + "@test.com";

        restTemplate.postForEntity("/api/auth/register", Map.of(
                "email", email,
                "username", "user_" + unique,
                "password", "password123"
        ), Map.class);

        ResponseEntity<Map> response = restTemplate.postForEntity(
                "/api/auth/login",
                Map.of("email", email, "password", "wrongpassword"),
                Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }
}
