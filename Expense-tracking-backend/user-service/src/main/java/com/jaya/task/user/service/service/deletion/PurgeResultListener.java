package com.jaya.task.user.service.service.deletion;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.common.deletion.AccountDeletionTopics;
import com.jaya.common.deletion.PurgeUserResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Consumes {@link PurgeUserResult} messages emitted by participant services
 * and forwards them to the orchestrator. Enabled only when Kafka is
 * configured; the monolithic in-memory router bypasses this listener.
 */
@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(prefix = "spring.kafka", name = "bootstrap-servers")
public class PurgeResultListener {

    private final AccountDeletionService accountDeletionService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = AccountDeletionTopics.PURGE_RESULTS,
            groupId = "${account-deletion.result-consumer-group:user-service-deletion-results}")
    public void onResult(String rawPayload) {
        try {
            PurgeUserResult result = objectMapper.readValue(rawPayload, PurgeUserResult.class);
            accountDeletionService.handleResult(result);
        } catch (Exception e) {
            log.error("Failed to process purge result payload={}", rawPayload, e);
        }
    }
}
