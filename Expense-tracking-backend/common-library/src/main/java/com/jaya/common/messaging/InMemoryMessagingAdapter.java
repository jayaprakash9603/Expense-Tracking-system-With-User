package com.jaya.common.messaging;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

@Component
@ConditionalOnProperty(name = "kafka.enabled", havingValue = "false")
@Slf4j
public class InMemoryMessagingAdapter implements MessagingPort {

    private final ApplicationEventPublisher eventPublisher;

    public InMemoryMessagingAdapter(ApplicationEventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
    }

    @Override
    public void send(String topic, Object event) {
        send(topic, null, event);
    }

    @Override
    public void send(String topic, String key, Object event) {
        log.debug("InMemory send: topic={}, key={}, type={}", topic, key,
                event != null ? event.getClass().getSimpleName() : "null");
        eventPublisher.publishEvent(new TopicEvent(this, topic, key, event));
    }

    @Override
    public CompletableFuture<Void> sendAsync(String topic, String key, Object event) {
        log.debug("InMemory sendAsync: topic={}, key={}, type={}", topic, key,
                event != null ? event.getClass().getSimpleName() : "null");
        try {
            eventPublisher.publishEvent(new TopicEvent(this, topic, key, event));
            return CompletableFuture.completedFuture(null);
        } catch (Exception ex) {
            return CompletableFuture.failedFuture(ex);
        }
    }
}
