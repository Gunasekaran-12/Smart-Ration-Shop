package com.smartration.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatTurnDto {
    private String role; // "user" or "bot" / "assistant"
    private String content; // message text
}

