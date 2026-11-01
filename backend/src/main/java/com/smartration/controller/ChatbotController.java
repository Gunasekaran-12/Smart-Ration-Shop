package com.smartration.controller;

import com.smartration.dto.ChatMessageRequest;
import com.smartration.dto.ChatMessageResponse;
import com.smartration.service.ChatbotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping({"/query", "/message"})
    public ResponseEntity<ChatMessageResponse> processChatbotMessage(@Valid @RequestBody ChatMessageRequest request) {
        return ResponseEntity.ok(chatbotService.processMessage(request));
    }
}
