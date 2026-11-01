package com.smartration.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageRequest {

    @NotBlank(message = "Message text cannot be empty")
    private String message;

    private Long shopId;

    private String language; // "en" or "ta"

    private Long rationCardId;

    private String conversationId;

    private List<ChatTurnDto> history;
}
