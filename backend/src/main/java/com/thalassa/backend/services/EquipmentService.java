package com.thalassa.backend.services;

import com.thalassa.backend.dto.EquipmentEnergyCost;
import com.thalassa.backend.dto.EquipmentRequest;
import com.thalassa.backend.dto.EquipmentResponse;
import com.thalassa.backend.dto.EnergyResponse;
import com.thalassa.backend.exceptions.ResourceNotFoundException;
import com.thalassa.backend.models.Aquarium;
import com.thalassa.backend.models.Equipment;
import com.thalassa.backend.models.User;
import com.thalassa.backend.repositories.AquariumRepository;
import com.thalassa.backend.repositories.EquipmentRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final AquariumRepository aquariumRepository;

    public EquipmentService(EquipmentRepository equipmentRepository,
                            AquariumRepository aquariumRepository) {
        this.equipmentRepository = equipmentRepository;
        this.aquariumRepository = aquariumRepository;
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private User getAuthenticatedUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private Aquarium getOwnedAquarium(Long aquariumId, Long userId) {
        return aquariumRepository.findByIdAndUserId(aquariumId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Acuario no encontrado."));
    }

    // ── Operaciones ───────────────────────────────────────────────────────────

    public List<EquipmentResponse> listEquipment(Long aquariumId) {
        User user = getAuthenticatedUser();
        getOwnedAquarium(aquariumId, user.getId());
        return equipmentRepository.findByAquariumId(aquariumId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public EquipmentResponse addEquipment(Long aquariumId, EquipmentRequest request) {
        User user = getAuthenticatedUser();
        Aquarium aquarium = getOwnedAquarium(aquariumId, user.getId());

        Equipment equipment = Equipment.builder()
                .name(request.getName())
                .powerWatts(request.getPowerWatts())
                .hoursPerDay(request.getHoursPerDay())
                .aquarium(aquarium)
                .build();

        return mapToResponse(equipmentRepository.save(equipment));
    }

    @Transactional
    public EquipmentResponse updateEquipment(Long equipmentId, EquipmentRequest request) {
        User user = getAuthenticatedUser();
        Equipment equipment = equipmentRepository.findByIdAndAquariumUserId(equipmentId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipo no encontrado."));

        equipment.setName(request.getName());
        equipment.setPowerWatts(request.getPowerWatts());
        equipment.setHoursPerDay(request.getHoursPerDay());

        return mapToResponse(equipmentRepository.save(equipment));
    }

    @Transactional
    public void deleteEquipment(Long equipmentId) {
        User user = getAuthenticatedUser();
        Equipment equipment = equipmentRepository.findByIdAndAquariumUserId(equipmentId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipo no encontrado."));
        equipmentRepository.delete(equipment);
    }

    /**
     * Calcula el coste energético mensual de todos los equipos de un acuario.
     *
     * Fórmula por equipo:
     *   kWh/mes = (powerWatts / 1000.0) * hoursPerDay * 30   → double (magnitud física)
     *   coste   = kWh/mes * electricityPriceKwh               → BigDecimal (dinero)
     */
    public EnergyResponse calculateEnergy(Long aquariumId) {
        User user = getAuthenticatedUser();

        if (user.getElectricityPriceKwh() == null) {
            throw new IllegalStateException(
                    "Configura el precio del kWh en tu perfil antes de calcular el coste energético.");
        }

        Aquarium aquarium = getOwnedAquarium(aquariumId, user.getId());
        List<Equipment> equipmentList = equipmentRepository.findByAquariumId(aquariumId);
        double priceKwh = user.getElectricityPriceKwh();

        List<EquipmentEnergyCost> breakdown = equipmentList.stream()
                .map(e -> {
                    double kWhPerMonth = (e.getPowerWatts() / 1000.0) * e.getHoursPerDay() * 30.0;
                    BigDecimal monthlyCost = BigDecimal.valueOf(kWhPerMonth)
                            .multiply(BigDecimal.valueOf(priceKwh))
                            .setScale(4, RoundingMode.HALF_UP);
                    return EquipmentEnergyCost.builder()
                            .equipmentId(e.getId())
                            .name(e.getName())
                            .powerWatts(e.getPowerWatts())
                            .hoursPerDay(e.getHoursPerDay())
                            .monthlyCost(monthlyCost)
                            .build();
                })
                .toList();

        BigDecimal totalMonthlyCost = breakdown.stream()
                .map(EquipmentEnergyCost::getMonthlyCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return EnergyResponse.builder()
                .aquariumId(aquariumId)
                .aquariumName(aquarium.getName())
                .totalMonthlyCost(totalMonthlyCost)
                .electricityPriceKwh(priceKwh)
                .currencySymbol("€")
                .equipmentBreakdown(breakdown)
                .build();
    }

    // ── Mapeo ─────────────────────────────────────────────────────────────────

    private EquipmentResponse mapToResponse(Equipment e) {
        return EquipmentResponse.builder()
                .id(e.getId())
                .name(e.getName())
                .powerWatts(e.getPowerWatts())
                .hoursPerDay(e.getHoursPerDay())
                .build();
    }
}
