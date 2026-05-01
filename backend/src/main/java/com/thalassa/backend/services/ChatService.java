package com.thalassa.backend.services;

import com.thalassa.backend.dto.ChatRequest;
import com.thalassa.backend.dto.ChatResponse;
import com.thalassa.backend.exceptions.RateLimitExceededException;
import com.thalassa.backend.models.Aquarium;
import com.thalassa.backend.models.SubscriptionPlan;
import com.thalassa.backend.models.User;
import com.thalassa.backend.repositories.AquariumRepository;
import com.thalassa.backend.repositories.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ChatService {

    private final RestClient scraperRestClient;
    private final UserRepository userRepository;
    private final AquariumRepository aquariumRepository;

    @Value("${chat.free-daily-limit}")
    private int freeDailyLimit;

    public ChatService(
            RestClient scraperRestClient,
            UserRepository userRepository,
            AquariumRepository aquariumRepository) {
        this.scraperRestClient = scraperRestClient;
        this.userRepository = userRepository;
        this.aquariumRepository = aquariumRepository;
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private User getAuthenticatedUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    // ── Usage query ──────────────────────────────────────────────────────────

    public com.thalassa.backend.dto.ChatUsageResponse getChatUsage() {
        User user = getAuthenticatedUser();

        LocalDate today = LocalDate.now();
        int used = today.equals(user.getLastChatDate()) ? user.getChatCountToday() : 0;
        int limit = (user.getSubscriptionPlan() == SubscriptionPlan.REEFMASTER) ? -1 : freeDailyLimit;

        return com.thalassa.backend.dto.ChatUsageResponse.builder()
                .used(used)
                .limit(limit)
                .build();
    }

    // ── Rate-limit ────────────────────────────────────────────────────────────

    /**
     * Solo verifica la cuota sin tocarla.
     * Lanza excepción si el usuario FREE ya agotó su límite diario.
     */
    private void checkRateLimit(User user) {
        if (user.getSubscriptionPlan() == SubscriptionPlan.REEFMASTER) return;

        LocalDate today = LocalDate.now();
        int count = today.equals(user.getLastChatDate()) ? user.getChatCountToday() : 0;

        if (count >= freeDailyLimit) {
            throw new RateLimitExceededException(
                    "Has alcanzado el límite diario de " + freeDailyLimit +
                    " mensajes con el plan FREE. Actualiza a REEFMASTER para consultas ilimitadas.");
        }
    }

    /**
     * Incrementa el contador diario. Solo llamar tras una respuesta exitosa de Python.
     * Resetea el contador si el día cambió desde la última consulta.
     */
    private void incrementRateLimit(User user) {
        if (user.getSubscriptionPlan() == SubscriptionPlan.REEFMASTER) return;

        LocalDate today = LocalDate.now();
        if (!today.equals(user.getLastChatDate())) {
            user.setChatCountToday(0);
            user.setLastChatDate(today);
        }
        user.setChatCountToday(user.getChatCountToday() + 1);
    }

    // ── Operaciones ───────────────────────────────────────────────────────────

    /**
     * Patrón "reservar y confirmar": verifica cuota → llama Python → solo incrementa en éxito.
     * El usuario FREE no pierde una consulta por un corte del servicio IA (GEMINI_UNAVAILABLE).
     */
    @Transactional
    public ChatResponse sendMessage(ChatRequest request) {
        User user = getAuthenticatedUser();

        checkRateLimit(user);

        Map<String, Object> aquariumContext = null;
        if (request.getAquariumId() != null) {
            aquariumContext = buildAquariumContext(request.getAquariumId(), user.getId());
        }

        ChatResponse response = callPythonChat(request.getMessage(), aquariumContext);

        // No contar si Python era inalcanzable (fallo de infraestructura)
        if (!"GEMINI_UNAVAILABLE".equals(response.getErrorCode())) {
            incrementRateLimit(user);
            userRepository.save(user);
        }

        return response;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Carga el acuario y transforma sus datos en el mapa que espera el prompt de Python.
     * Si el acuario no pertenece al usuario autenticado, devuelve null sin error.
     */
    private Map<String, Object> buildAquariumContext(Long aquariumId, Long userId) {
        return aquariumRepository.findByIdAndUserId(aquariumId, userId)
                .map(aquarium -> {
                    Map<String, Object> ctx = new HashMap<>();
                    ctx.put("name", aquarium.getName());
                    ctx.put("liters", aquarium.getLiters());
                    ctx.put("type", aquarium.getType().name());

                    List<Map<String, String>> livestock = aquarium.getLivestock().stream()
                            .map(ls -> Map.of("name", ls.getName()))
                            .toList();
                    ctx.put("livestock", livestock);

                    List<Map<String, String>> equipment = aquarium.getEquipment().stream()
                            .map(eq -> Map.of("name", eq.getName()))
                            .toList();
                    ctx.put("equipment", equipment);

                    return ctx;
                })
                .orElse(null);
    }

    /**
     * Llama a POST /chat/message en el microservicio Python.
     * Siempre devuelve un ChatResponse; si hay error de red, usa errorCode.
     */
    ChatResponse callPythonChat(String message, Map<String, Object> aquariumContext) {
        // Request body interno que el microservicio Python espera
        record PythonChatRequest(String message, Map<String, Object> aquarium_context) {}
        record PythonChatError(String code, String message) {}
        record PythonChatResponse(String reply, PythonChatError error) {}

        try {
            PythonChatResponse pythonResponse = scraperRestClient.post()
                    .uri("/chat/message")
                    .body(new PythonChatRequest(message, aquariumContext))
                    .retrieve()
                    .body(PythonChatResponse.class);

            if (pythonResponse == null) {
                return errorResponse("GEMINI_ERROR");
            }

            String errorCode = (pythonResponse.error() != null)
                    ? pythonResponse.error().code()
                    : null;

            return ChatResponse.builder()
                    .reply(pythonResponse.reply() != null ? pythonResponse.reply() : "")
                    .errorCode(errorCode)
                    .build();

        } catch (ResourceAccessException e) {
            return errorResponse("GEMINI_UNAVAILABLE");
        } catch (RestClientException e) {
            return errorResponse("GEMINI_ERROR");
        }
    }

    private ChatResponse errorResponse(String errorCode) {
        return ChatResponse.builder()
                .reply("")
                .errorCode(errorCode)
                .build();
    }
}
