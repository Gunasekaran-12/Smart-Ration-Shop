package com.smartration.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageResponse {
    private String reply;
    private String intentDetected;
    private List<String> suggestions;
    private String source;
    private String timestamp;
    private boolean isInformationalOnly;
    private String conversationId;
    private String resolvedEntity;
    private Map<String, Object> data;

    @JsonProperty("quickReplies")
    public List<String> getQuickReplies() {
        return suggestions;
    }
}
