package com.thalassa.backend.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import com.thalassa.backend.dto.ChatRequest;
import com.thalassa.backend.dto.ChatResponse;
import com.thalassa.backend.exceptions.RateLimitExceededException;
import com.thalassa.backend.models.SubscriptionPlan;
import com.thalassa.backend.models.User;
import com.thalassa.backend.repositories.AquariumRepository;
import com.thalassa.backend.repositories.UserRepository;
import java.time.LocalDate;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestClient;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

  @Mock RestClient scraperRestClient;
  @Mock UserRepository userRepository;
  @Mock AquariumRepository aquariumRepository;

  // Spy created manually in setUp() — allows stubbing package-private callPythonChat
  ChatService chatService;

  private static final int FREE_DAILY_LIMIT = 5;

  private static final ChatResponse PYTHON_OK =
      ChatResponse.builder().reply("OK").errorCode(null).build();
  private static final ChatResponse PYTHON_DOWN =
      ChatResponse.builder().reply("").errorCode("GEMINI_UNAVAILABLE").build();

  @BeforeEach
  void setUp() {
    chatService = spy(new ChatService(scraperRestClient, userRepository, aquariumRepository));
    ReflectionTestUtils.setField(chatService, "freeDailyLimit", FREE_DAILY_LIMIT);
  }

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

  // ── Rate limit — FREE plan ────────────────────────────────────────────────

  @Test
  void sendMessage_freePlan_underLimit_incrementsCounter() {
    User user =
        User.builder()
            .id(1L)
            .subscriptionPlan(SubscriptionPlan.FREE)
            .chatCountToday(4)
            .lastChatDate(LocalDate.now())
            .build();
    authenticateAs(user);
    when(userRepository.save(any(User.class))).thenReturn(user);
    doReturn(PYTHON_OK).when(chatService).callPythonChat(anyString(), any());

    chatService.sendMessage(ChatRequest.builder().message("hi").aquariumId(null).build());

    assertThat(user.getChatCountToday()).isEqualTo(5);
    verify(userRepository).save(user);
  }

  @Test
  void sendMessage_freePlan_atLimit_throwsRateLimitExceeded() {
    User user =
        User.builder()
            .id(1L)
            .subscriptionPlan(SubscriptionPlan.FREE)
            .chatCountToday(FREE_DAILY_LIMIT)
            .lastChatDate(LocalDate.now())
            .build();
    authenticateAs(user);

    assertThatThrownBy(
            () ->
                chatService.sendMessage(
                    ChatRequest.builder().message("one more").aquariumId(null).build()))
        .isInstanceOf(RateLimitExceededException.class);

    // Python must NOT be called when quota is already exhausted
    verify(chatService, never()).callPythonChat(anyString(), any());
  }

  // ── B-1 fix: Python failure must NOT consume quota ────────────────────────

  @Test
  void sendMessage_pythonUnavailable_doesNotIncrementCounter() {
    User user =
        User.builder()
            .id(1L)
            .subscriptionPlan(SubscriptionPlan.FREE)
            .chatCountToday(3)
            .lastChatDate(LocalDate.now())
            .build();
    authenticateAs(user);
    doReturn(PYTHON_DOWN).when(chatService).callPythonChat(anyString(), any());

    ChatResponse result =
        chatService.sendMessage(ChatRequest.builder().message("hi").aquariumId(null).build());

    assertThat(result.getErrorCode()).isEqualTo("GEMINI_UNAVAILABLE");
    // Quota must NOT be consumed on infrastructure failure
    assertThat(user.getChatCountToday()).isEqualTo(3);
    verify(userRepository, never()).save(any());
  }

  // ── REEFMASTER — no rate limit ────────────────────────────────────────────

  @Test
  void sendMessage_reefmasterPlan_noRateLimitApplied() {
    User user =
        User.builder()
            .id(2L)
            .subscriptionPlan(SubscriptionPlan.REEFMASTER)
            .chatCountToday(100)
            .lastChatDate(LocalDate.now())
            .build();
    authenticateAs(user);
    doReturn(PYTHON_OK).when(chatService).callPythonChat(anyString(), any());

    chatService.sendMessage(ChatRequest.builder().message("analyze").aquariumId(null).build());

    // REEFMASTER: incrementRateLimit is a no-op — counter must stay at 100
    assertThat(user.getChatCountToday()).isEqualTo(100);
  }
}
