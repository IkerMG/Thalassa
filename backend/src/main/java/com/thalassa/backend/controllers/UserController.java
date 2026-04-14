package com.thalassa.backend.controllers;

import com.thalassa.backend.dto.UpdateUserRequest;
import com.thalassa.backend.dto.UserResponse;
import com.thalassa.backend.services.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * GET /api/users/me
     * Devuelve el perfil del usuario autenticado.
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getProfile() {
        return ResponseEntity.ok(userService.getProfile());
    }

    /**
     * PUT /api/users/me
     * Actualiza el precio del kWh del usuario autenticado.
     * Este valor se usa para el cálculo de coste energético.
     */
    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateElectricityPrice(
            @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userService.updateElectricityPrice(request));
    }
}
