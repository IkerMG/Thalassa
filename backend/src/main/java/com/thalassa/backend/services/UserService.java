package com.thalassa.backend.services;

import com.thalassa.backend.dto.ChangePasswordRequest;
import com.thalassa.backend.dto.UpdateUserRequest;
import com.thalassa.backend.dto.UserResponse;
import com.thalassa.backend.models.SubscriptionPlan;
import com.thalassa.backend.models.User;
import com.thalassa.backend.repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
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
    if (request.getDisplayName() != null && !request.getDisplayName().isBlank()) {
      user.setDisplayName(request.getDisplayName().trim());
    }
    if (request.getElectricityPriceKwh() != null) {
      user.setElectricityPriceKwh(request.getElectricityPriceKwh());
    }
    if (request.getLocale() != null) {
      user.setLocale(request.getLocale());
    }
    if (request.getTemperatureUnit() != null) {
      user.setTemperatureUnit(request.getTemperatureUnit());
    }
    if (request.getVolumeUnit() != null) {
      user.setVolumeUnit(request.getVolumeUnit());
    }
    if (request.getAvatarUrl() != null) {
      user.setAvatarUrl(request.getAvatarUrl().isBlank() ? null : request.getAvatarUrl().trim());
    }
    User saved = userRepository.save(user);
    return mapToResponse(saved);
  }

  @Transactional
  public void changePassword(ChangePasswordRequest request) {
    User user = getAuthenticatedUser();
    if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "INVALID_CURRENT_PASSWORD");
    }
    user.setPassword(passwordEncoder.encode(request.getNewPassword()));
    userRepository.save(user);
  }

  @Transactional
  public UserResponse simulateUpgrade() {
    User user = getAuthenticatedUser();
    user.setSubscriptionPlan(SubscriptionPlan.REEFMASTER);
    User saved = userRepository.save(user);
    return mapToResponse(saved);
  }

  // ── Mapeo ─────────────────────────────────────────────────────────────────

  private UserResponse mapToResponse(User user) {
    String displayName = user.getDisplayName() != null ? user.getDisplayName() : user.getDisplayUsername();
    return UserResponse.builder()
        .id(user.getId())
        .username(user.getDisplayUsername())
        .email(user.getEmail())
        .displayName(displayName)
        .subscriptionPlan(user.getSubscriptionPlan())
        .electricityPriceKwh(user.getElectricityPriceKwh())
        .locale(user.getLocale())
        .temperatureUnit(user.getTemperatureUnit())
        .volumeUnit(user.getVolumeUnit())
        .avatarUrl(user.getAvatarUrl())
        .build();
  }
}
