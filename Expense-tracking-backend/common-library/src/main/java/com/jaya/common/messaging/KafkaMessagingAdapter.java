package com.jaya.common.messaging;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

@Component
@ConditionalOnProperty(name = "kafka.enabled", havingValue = "true", matchIfMissing = true)
@ConditionalOnClass(KafkaTemplate.class)
@Slf4j
public class KafkaMessagingAdapter implements MessagingPort {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public KafkaMessagingAdapter(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    @Override
    public void send(String topic, Object event) {
        send(topic, null, event);
    }

    @Override
    public void send(String topic, String key, Object event) {
        log.debug("Kafka send: topic={}, key={}, type={}", topic, key,
                event != null ? event.getClass().getSimpleName() : "null");
        kafkaTemplate.send(topic, key, event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Failed to send to Kafka topic '{}': {}", topic, ex.getMessage(), ex);
                    } else {
                        log.debug("Sent to topic '{}' partition={} offset={}",
                                topic,
                                result.getRecordMetadata().partition(),
                                result.getRecordMetadata().offset());
                    }
                });
    }

    @Override
    public CompletableFuture<Void> sendAsync(String topic, String key, Object event) {
        log.debug("Kafka sendAsync: topic={}, key={}, type={}", topic, key,
                event != null ? event.getClass().getSimpleName() : "null");
        return kafkaTemplate.send(topic, key, event)
                .thenAccept(result -> log.debug("Async sent to topic '{}' partition={} offset={}",
                        topic,
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset()))
                .exceptionally(ex -> {
                    log.error("Async send failed for topic '{}': {}", topic, ex.getMessage(), ex);
                    return null;
                });
    }
}
