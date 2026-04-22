package com.thalassa.backend.services;

import com.thalassa.backend.dto.DashboardSummaryResponse;
import com.thalassa.backend.models.Aquarium;
import com.thalassa.backend.models.User;
import com.thalassa.backend.repositories.AquariumRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DashboardService {

    private final AquariumRepository aquariumRepository;

    public DashboardService(AquariumRepository aquariumRepository) {
        this.aquariumRepository = aquariumRepository;
    }

    private User getAuthenticatedUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    public DashboardSummaryResponse getSummary() {
        User user = getAuthenticatedUser();
        List<Aquarium> aquariums = aquariumRepository.findByUserId(user.getId());

        int totalLivestock = aquariums.stream()
                .mapToInt(a -> a.getLivestock().size())
                .sum();

        int totalEquipment = aquariums.stream()
                .mapToInt(a -> a.getEquipment().size())
                .sum();

        return DashboardSummaryResponse.builder()
                .aquariumCount(aquariums.size())
                .totalLivestock(totalLivestock)
                .totalEquipment(totalEquipment)
                .build();
    }
}
