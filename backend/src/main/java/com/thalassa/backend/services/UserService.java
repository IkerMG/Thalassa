package com.thalassa.backend.services;

import com.thalassa.backend.dto.UpdateUserRequest;
import com.thalassa.backend.dto.UserResponse;
import com.thalassa.backend.models.User;
import com.thalassa.backend.repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private User getAuthenticatedUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    // ── Operaciones ───────────────────────────────────────────────────────────

    public UserResponse getProfile() {
        return mapToResponse(getAuthenticatedUser());
    }

    @Transactional
    public UserResponse updateElectricityPrice(UpdateUserRequest request) {
        User user = getAuthenticatedUser();
        user.setElectricityPriceKwh(request.getElectricityPriceKwh());
        User saved = userRepository.save(user);
        return mapToResponse(saved);
    }

    // ── Mapeo ─────────────────────────────────────────────────────────────────

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .subscriptionPlan(user.getSubscriptionPlan())
                .electricityPriceKwh(user.getElectricityPriceKwh())
                .build();
    }
}
