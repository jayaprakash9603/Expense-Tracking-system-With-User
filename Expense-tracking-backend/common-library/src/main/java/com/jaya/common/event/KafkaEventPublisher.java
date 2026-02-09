package com.jaya.common.event;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/**
 * Kafka event publisher for microservices mode.
 * Uses KafkaTemplate to publish events to Kafka topics.
 * Active when kafka.enabled=true (default) and not in monolithic profile.
 */
@Component
@Profile("!monolithic")
@ConditionalOnProperty(name = "kafka.enabled", havingValue = "true", matchIfMissing = true)
@ConditionalOnClass(KafkaTemplate.class)
@Slf4j
public class KafkaEventPublisher<T> implements EventPublisher<T> {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final String defaultTopic;

    public KafkaEventPublisher(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
        this.defaultTopic = "default-events";
    }

    @Override
    public void publish(T event) {
        publish(defaultTopic, event);
    }

    @Override
    public void publish(String topic, T event) {
        log.debug("KafkaEventPublisher: Publishing event to topic '{}': {}", 
                  topic, event.getClass().getSimpleName());
        kafkaTemplate.send(topic, event)
            .whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Failed to publish event to Kafka topic '{}': {}", topic, ex.getMessage(), ex);
                } else {
                    log.debug("Event published to Kafka topic '{}' at partition {} offset {}", 
                              topic, 
                              result.getRecordMetadata().partition(),
                              result.getRecordMetadata().offset());
                }
            });
    }

    @Override
    public void publish(String topic, String key, T event) {
        log.debug("KafkaEventPublisher: Publishing event to topic '{}' with key '{}': {}", 
                  topic, key, event.getClass().getSimpleName());
        kafkaTemplate.send(topic, key, event)
            .whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Failed to publish event to Kafka topic '{}' with key '{}': {}", 
                              topic, key, ex.getMessage(), ex);
                } else {
                    log.debug("Event published to Kafka topic '{}' at partition {} offset {}", 
                              topic, 
                              result.getRecordMetadata().partition(),
                              result.getRecordMetadata().offset());
                }
            });
    }
}
