package com.smartration.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@Slf4j
public class SseService {

    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public SseEmitter subscribe(String username) {
        // 30 minute timeout
        SseEmitter emitter = new SseEmitter(1800000L);

        emitters.add(emitter);
        log.info("New SSE client subscribed: user={}, total active={}", username, emitters.size());

        emitter.onCompletion(() -> {
            emitters.remove(emitter);
            log.info("SSE client completed: total active={}", emitters.size());
        });

        emitter.onTimeout(() -> {
            emitters.remove(emitter);
            emitter.complete();
            log.info("SSE client timed out: total active={}", emitters.size());
        });

        emitter.onError(e -> {
            emitters.remove(emitter);
            log.info("SSE client error: total active={}", emitters.size());
        });

        // Send initial connect greeting event
        try {
            emitter.send(SseEmitter.event()
                    .name("CONNECTED")
                    .data("{\"status\":\"CONNECTED\",\"message\":\"Live dashboard stream established\"}"));
        } catch (IOException e) {
            emitters.remove(emitter);
        }

        return emitter;
    }

    public void broadcastEvent(String eventName, Object data) {
        log.info("Broadcasting SSE event: '{}' to {} clients", eventName, emitters.size());
        List<SseEmitter> deadEmitters = new CopyOnWriteArrayList<>();

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name(eventName)
                        .data(data));
            } catch (Exception e) {
                deadEmitters.add(emitter);
            }
        }

        emitters.removeAll(deadEmitters);
    }
}
