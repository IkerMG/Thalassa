package com.thalassa.backend.services;

import com.thalassa.backend.dto.ChatRequest;
import com.thalassa.backend.dto.ChatResponse;
import com.thalassa.backend.exceptions.RateLimitExceededException;
import com.thalassa.backend.models.Aquarium;
import com.thalassa.backend.models.SubscriptionPlan;
import com.thalassa.backend.models.User;
import com.thalassa.backend.repositories.AquariumRepository;
import com.thalassa.backend.repositories.UserRepository;
import jakarta.transaction.Transactional;
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

    // ── Rate-limit ────────────────────────────────────────────────────────────

    /**
     * Verifica y actualiza el contador diario de mensajes del usuario.
     * Si la fecha cambió (nuevo día), resetea el contador.
     * Solo aplica a usuarios con plan FREE.
     *
     * @throws AccessDeniedException si el usuario FREE ha superado el límite diario.
     */
    private void checkAndIncrementRateLimit(User user) {
        if (user.getSubscriptionPlan() == SubscriptionPlan.REEFMASTER) {
            return; // Sin límite para REEFMASTER
        }

        LocalDate today = LocalDate.now();

        if (!today.equals(user.getLastChatDate())) {
            // Nuevo día — reinicia el contador
            user.setChatCountToday(0);
            user.setLastChatDate(today);
        }

        if (user.getChatCountToday() >= freeDailyLimit) {
            throw new RateLimitExceededException(
                    "Has alcanzado el límite diario de " + freeDailyLimit +
                    " mensajes con el plan FREE. Actualiza a REEFMASTER para consultas ilimitadas.");
        }

        user.setChatCountToday(user.getChatCountToday() + 1);
    }

    // ── Operaciones ───────────────────────────────────────────────────────────

    /**
     * Envía el mensaje del usuario al microservicio Python Gemini.
     *
     * <p>Flujo:
     * <ol>
     *   <li>Verifica y actualiza el rate-limit del usuario autenticado.</li>
     *   <li>Si se proporcionó {@code aquariumId}, carga el acuario y construye el contexto.</li>
     *   <li>Llama a {@code POST /chat/message} en el microservicio Python.</li>
     *   <li>Persiste el contador actualizado.</li>
     *   <li>Devuelve la respuesta del asistente.</li>
     * </ol>
     *
     * <p>Política de errores — siempre devuelve HTTP 200:
     * <ul>
     *   <li>Timeout / conexión rechazada → {@code errorCode = "GEMINI_UNAVAILABLE"}, reply vacío.</li>
     *   <li>Error HTTP del scraper       → {@code errorCode = "GEMINI_ERROR"}, reply vacío.</li>
     *   <li>Python devuelve error propio → se propaga el código que manda Python.</li>
     * </ul>
     */
    @Transactional
    public ChatResponse sendMessage(ChatRequest request) {
        User user = getAuthenticatedUser();

        // Verifica y actualiza el rate-limit ANTES de llamar a Python
        checkAndIncrementRateLimit(user);

        // Construye el contexto del acuario si se proporcionó ID
        Map<String, Object> aquariumContext = null;
        if (request.getAquariumId() != null) {
            aquariumContext = buildAquariumContext(request.getAquariumId(), user.getId());
        }

        // Llama al microservicio Python
        ChatResponse response = callPythonChat(request.getMessage(), aquariumContext);

        // Persiste el contador de mensajes (incluso si Gemini falló — el límite cuenta la llamada)
        userRepository.save(user);

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
    private ChatResponse callPythonChat(String message, Map<String, Object> aquariumContext) {
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
