package com.thalassa.backend.controllers;

import com.thalassa.backend.dto.ChatRequest;
import com.thalassa.backend.dto.ChatResponse;
import com.thalassa.backend.dto.ChatUsageResponse;
import com.thalassa.backend.services.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    /**
     * POST /api/chat
     * Proxy al asistente IA Gemini con rate-limiting por plan.
     * Siempre devuelve 200; si el modelo falla, errorCode lo indica.
     * Devuelve 429 si el usuario FREE ha superado el límite diario.
     */
    @PostMapping
    public ResponseEntity<ChatResponse> sendMessage(@RequestBody ChatRequest request) {
        return ResponseEntity.ok(chatService.sendMessage(request));
    }

    /**
     * GET /api/chat/usage
     * Returns today's message count and the plan limit (-1 = unlimited).
     */
    @GetMapping("/usage")
    public ResponseEntity<ChatUsageResponse> getChatUsage() {
        return ResponseEntity.ok(chatService.getChatUsage());
    }
}
