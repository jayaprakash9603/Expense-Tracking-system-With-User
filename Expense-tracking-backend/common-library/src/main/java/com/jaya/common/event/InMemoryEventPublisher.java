package com.jaya.common.event;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * In-memory event publisher for monolithic mode.
 * Uses Spring's ApplicationEventPublisher to dispatch events locally.
 * Active when kafka.enabled=false or in monolithic profile.
 */
@Component
@Profile("monolithic")
@ConditionalOnProperty(name = "kafka.enabled", havingValue = "false", matchIfMissing = false)
@Slf4j
public class InMemoryEventPublisher<T> implements EventPublisher<T> {

    private final ApplicationEventPublisher applicationEventPublisher;

    public InMemoryEventPublisher(ApplicationEventPublisher applicationEventPublisher) {
        this.applicationEventPublisher = applicationEventPublisher;
    }

    @Override
    public void publish(T event) {
        log.debug("InMemoryEventPublisher: Publishing event of type: {}", 
                  event.getClass().getSimpleName());
        applicationEventPublisher.publishEvent(new InMemoryEvent<>(event));
    }

    @Override
    public void publish(String topic, T event) {
        log.debug("InMemoryEventPublisher: Publishing event to topic '{}': {}", 
                  topic, event.getClass().getSimpleName());
        applicationEventPublisher.publishEvent(new InMemoryEvent<>(topic, event));
    }

    @Override
    public void publish(String topic, String key, T event) {
        log.debug("InMemoryEventPublisher: Publishing event to topic '{}' with key '{}': {}", 
                  topic, key, event.getClass().getSimpleName());
        applicationEventPublisher.publishEvent(new InMemoryEvent<>(topic, key, event));
    }

    /**
     * Wrapper event for in-memory publishing.
     * Contains the original event payload and optional metadata.
     */
    public static class InMemoryEvent<T> {
        private final String topic;
        private final String key;
        private final T payload;

        public InMemoryEvent(T payload) {
            this(null, null, payload);
        }

        public InMemoryEvent(String topic, T payload) {
            this(topic, null, payload);
        }

        public InMemoryEvent(String topic, String key, T payload) {
            this.topic = topic;
            this.key = key;
            this.payload = payload;
        }

        public String getTopic() {
            return topic;
        }

        public String getKey() {
            return key;
        }

        public T getPayload() {
            return payload;
        }
    }
}
