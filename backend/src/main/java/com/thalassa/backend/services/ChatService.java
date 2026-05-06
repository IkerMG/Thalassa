package com.thalassa.backend.services;

import com.thalassa.backend.dto.ChatRequest;
import com.thalassa.backend.dto.ChatResponse;
import com.thalassa.backend.exceptions.RateLimitExceededException;
import com.thalassa.backend.models.SubscriptionPlan;
import com.thalassa.backend.models.User;
import com.thalassa.backend.models.WaterParameter;
import com.thalassa.backend.repositories.AquariumRepository;
import com.thalassa.backend.repositories.UserRepository;
import com.thalassa.backend.repositories.WaterParameterRepository;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
public class ChatService {

  private final RestClient scraperRestClient;
  private final UserRepository userRepository;
  private final AquariumRepository aquariumRepository;
  private final WaterParameterRepository waterParameterRepository;

  @Value("${chat.free-daily-limit}")
  private int freeDailyLimit;

  public ChatService(
      RestClient scraperRestClient,
      UserRepository userRepository,
      AquariumRepository aquariumRepository,
      WaterParameterRepository waterParameterRepository) {
    this.scraperRestClient = scraperRestClient;
    this.userRepository = userRepository;
    this.aquariumRepository = aquariumRepository;
    this.waterParameterRepository = waterParameterRepository;
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

    return com.thalassa.backend.dto.ChatUsageResponse.builder().used(used).limit(limit).build();
  }

  // ── Rate-limit ────────────────────────────────────────────────────────────

  /**
   * Solo verifica la cuota sin tocarla. Lanza excepción si el usuario FREE ya agotó su límite
   * diario.
   */
  private void checkRateLimit(User user) {
    if (user.getSubscriptionPlan() == SubscriptionPlan.REEFMASTER) return;

    LocalDate today = LocalDate.now();
    int count = today.equals(user.getLastChatDate()) ? user.getChatCountToday() : 0;

    if (count >= freeDailyLimit) {
      throw new RateLimitExceededException(
          "Has alcanzado el límite diario de "
              + freeDailyLimit
              + " mensajes con el plan FREE. Actualiza a REEFMASTER para consultas ilimitadas.");
    }
  }

  /**
   * Incrementa el contador diario. Solo llamar tras una respuesta exitosa de Python. Resetea el
   * contador si el día cambió desde la última consulta.
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
   * Patrón "reservar y confirmar": verifica cuota → llama Python → solo incrementa en éxito. El
   * usuario FREE no pierde una consulta por un corte del servicio IA (GEMINI_UNAVAILABLE).
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
   * Carga el acuario y transforma sus datos en el mapa que espera el prompt de Python. Si el
   * acuario no pertenece al usuario autenticado, devuelve null sin error.
   */
  private Map<String, Object> buildAquariumContext(Long aquariumId, Long userId) {
    return aquariumRepository
        .findByIdAndUserId(aquariumId, userId)
        .map(
            aquarium -> {
              Map<String, Object> ctx = new HashMap<>();
              ctx.put("name", aquarium.getName());
              ctx.put("liters", aquarium.getLiters());
              ctx.put("type", aquarium.getType().name());

              List<Map<String, Object>> livestock =
                  aquarium.getLivestock().stream()
                      .map(
                          ls -> {
                            Map<String, Object> m = new LinkedHashMap<>();
                            m.put("name", ls.getName());
                            m.put("category", ls.getCategory() != null ? ls.getCategory().name() : null);
                            m.put("quantity", ls.getQuantity());
                            m.put("reefSafe", ls.getReefSafe());
                            return m;
                          })
                      .toList();
              ctx.put("livestock", livestock);

              List<Map<String, Object>> equipment =
                  aquarium.getEquipment().stream()
                      .map(
                          eq -> {
                            Map<String, Object> m = new LinkedHashMap<>();
                            m.put("name", eq.getName());
                            m.put("category", eq.getCategory() != null ? eq.getCategory().name() : null);
                            m.put("powerWatts", eq.getPowerWatts());
                            m.put("hoursPerDay", eq.getHoursPerDay());
                            return m;
                          })
                      .toList();
              ctx.put("equipment", equipment);

              ctx.put("waterParameters", buildLatestParameters(aquariumId));

              return ctx;
            })
        .orElse(null);
  }

  private Map<String, Object> buildLatestParameters(Long aquariumId) {
    Optional<WaterParameter> latest =
        waterParameterRepository.findFirstByAquariumIdOrderByMeasuredAtDesc(aquariumId);
    if (latest.isEmpty()) return null;
    WaterParameter p = latest.get();
    Map<String, Object> params = new LinkedHashMap<>();
    params.put("measuredAt", p.getMeasuredAt() != null ? p.getMeasuredAt().toString() : null);
    params.put("temperature", p.getTemperature());
    params.put("salinity", p.getSalinity());
    params.put("ph", p.getPh());
    params.put("alkalinity", p.getAlkalinityDKH());
    params.put("calcium", p.getCalciumPPM());
    params.put("magnesium", p.getMagnesiumPPM());
    params.put("nitrates", p.getNitratesPPM());
    params.put("phosphates", p.getPhosphatesPPM());
    return params;
  }

  /**
   * Llama a POST /chat/message en el microservicio Python. Siempre devuelve un ChatResponse; si hay
   * error de red, usa errorCode.
   */
  ChatResponse callPythonChat(String message, Map<String, Object> aquariumContext) {
    // Request body interno que el microservicio Python espera
    record PythonChatRequest(String message, Map<String, Object> aquarium_context) {}
    record PythonChatError(String code, String message) {}
    record PythonChatResponse(String reply, PythonChatError error) {}

    try {
      PythonChatResponse pythonResponse =
          scraperRestClient
              .post()
              .uri("/chat/message")
              .body(new PythonChatRequest(message, aquariumContext))
              .retrieve()
              .body(PythonChatResponse.class);

      if (pythonResponse == null) {
        return errorResponse("GEMINI_ERROR");
      }

      String errorCode = (pythonResponse.error() != null) ? pythonResponse.error().code() : null;

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
    return ChatResponse.builder().reply("").errorCode(errorCode).build();
  }
}
