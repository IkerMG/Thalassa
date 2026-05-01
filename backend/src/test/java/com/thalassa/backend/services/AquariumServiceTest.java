package com.thalassa.backend.services;

import com.thalassa.backend.dto.AquariumRequest;
import com.thalassa.backend.dto.AquariumSummaryResponse;
import com.thalassa.backend.exceptions.AccessDeniedException;
import com.thalassa.backend.models.Aquarium;
import com.thalassa.backend.models.AquariumType;
import com.thalassa.backend.models.SubscriptionPlan;
import com.thalassa.backend.models.User;
import com.thalassa.backend.repositories.AquariumRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AquariumServiceTest {

    @Mock AquariumRepository aquariumRepository;
    @InjectMocks AquariumService aquariumService;

    private final AquariumRequest request = AquariumRequest.builder()
            .name("My Reef").liters(200).type(AquariumType.REEF).build();

    @BeforeEach
    void setUp() {}

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(User user) {
        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(user);
        SecurityContext ctx = mock(SecurityContext.class);
        when(ctx.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(ctx);
    }

    // ── FREE plan ─────────────────────────────────────────────────────────────

    @Test
    void createAquarium_freePlan_firstAquarium_ok() {
        User user = User.builder().id(1L).subscriptionPlan(SubscriptionPlan.FREE).build();
        authenticateAs(user);

        when(aquariumRepository.countByUserId(1L)).thenReturn(0L);

        Aquarium saved = Aquarium.builder().id(10L).name("My Reef")
                .liters(200).type(AquariumType.REEF).user(user).build();
        when(aquariumRepository.save(any(Aquarium.class))).thenReturn(saved);

        AquariumSummaryResponse result = aquariumService.createAquarium(request);

        assertThat(result.getName()).isEqualTo("My Reef");
        assertThat(result.getLiters()).isEqualTo(200);
    }

    @Test
    void createAquarium_freePlan_secondAquarium_throwsAccessDenied() {
        User user = User.builder().id(1L).subscriptionPlan(SubscriptionPlan.FREE).build();
        authenticateAs(user);

        when(aquariumRepository.countByUserId(1L)).thenReturn(1L);

        assertThatThrownBy(() -> aquariumService.createAquarium(request))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("FREE");

        verify(aquariumRepository, never()).save(any());
    }

    // ── REEFMASTER plan ───────────────────────────────────────────────────────

    @Test
    void createAquarium_reefmasterPlan_noLimit() {
        User user = User.builder().id(2L).subscriptionPlan(SubscriptionPlan.REEFMASTER).build();
        authenticateAs(user);

        Aquarium saved = Aquarium.builder().id(20L).name("My Reef")
                .liters(200).type(AquariumType.REEF).user(user).build();
        when(aquariumRepository.save(any(Aquarium.class))).thenReturn(saved);

        // Should not call countByUserId for REEFMASTER
        AquariumSummaryResponse result = aquariumService.createAquarium(request);

        assertThat(result).isNotNull();
        verify(aquariumRepository, never()).countByUserId(anyLong());
    }
}
