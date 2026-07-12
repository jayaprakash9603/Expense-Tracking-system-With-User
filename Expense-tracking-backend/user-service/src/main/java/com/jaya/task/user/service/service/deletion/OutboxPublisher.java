package com.jaya.task.user.service.service.deletion;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.task.user.service.modal.deletion.DeletionOutbox;
import com.jaya.task.user.service.repository.deletion.DeletionOutboxRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Best-effort background publisher for the deletion outbox. Uses
 * {@link KafkaTemplate} when a broker is configured; otherwise the outbox
 * still records intent (useful in tests / monolithic mode where the
 * in-memory router can consume the same records directly).
 */
@Component
@Slf4j
public class OutboxPublisher {

    private final DeletionOutboxRepository outboxRepository;
    private final ObjectMapper objectMapper;
    private final ObjectProvider<KafkaTemplate<String, Object>> kafkaTemplateProvider;

    @Autowired
    public OutboxPublisher(DeletionOutboxRepository outboxRepository,
                           ObjectMapper objectMapper,
                           ObjectProvider<KafkaTemplate<String, Object>> kafkaTemplateProvider) {
        this.outboxRepository = outboxRepository;
        this.objectMapper = objectMapper;
        this.kafkaTemplateProvider = kafkaTemplateProvider;
    }

    @Scheduled(fixedDelayString = "${account-deletion.outbox-publish-interval-ms:5000}")
    @Transactional
    public void publishPending() {
        List<DeletionOutbox> pending = outboxRepository.findPendingBatch(LocalDateTime.now());
        if (pending.isEmpty()) {
            return;
        }
        KafkaTemplate<String, Object> template = kafkaTemplateProvider.getIfAvailable();
        for (DeletionOutbox entry : pending) {
            try {
                if (template != null) {
                    Object payload = objectMapper.readValue(entry.getPayload(), Object.class);
                    template.send(entry.getTopic(), entry.getMessageKey(), payload).get();
                }
                entry.setPublishedAt(LocalDateTime.now());
                entry.setLastError(null);
            } catch (Exception e) {
                entry.setAttemptCount(entry.getAttemptCount() + 1);
                entry.setLastError(truncate(e.getMessage()));
                entry.setNextAttemptAt(LocalDateTime.now().plus(Duration.ofSeconds(
                        Math.min(300L, (long) Math.pow(2, entry.getAttemptCount())))));
                log.warn("Failed to publish outbox entry {} to topic {}: {}",
                        entry.getId(), entry.getTopic(), e.getMessage());
            }
            outboxRepository.save(entry);
        }
    }

    private static String truncate(String s) {
        if (s == null) return null;
        return s.length() > 1000 ? s.substring(0, 1000) : s;
    }
}
