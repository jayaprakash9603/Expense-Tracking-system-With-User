package com.jaya.common.deletion;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;

import java.time.Instant;

/**
 * Reusable base for participant purge handlers. Concrete services implement
 * {@link #purge(PurgeUserCommand)} with their own idempotent delete/anonymize
 * logic; this base takes care of result publication, exception mapping, and
 * safe no-op behavior when the target user has no data in this service.
 */
@Slf4j
public abstract class AbstractPurgeHandler {

    private final String serviceName;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper;

    protected AbstractPurgeHandler(String serviceName,
                                    KafkaTemplate<String, Object> kafkaTemplate,
                                    ObjectMapper objectMapper) {
        this.serviceName = serviceName;
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Perform the actual delete/anonymize work for this service. Implementations
     * MUST be idempotent: repeated invocations for the same {@code userId} must
     * be safe and MUST NOT throw when the user has no data here.
     */
    protected abstract void purge(PurgeUserCommand command) throws Exception;

    public final void handle(String rawPayload) {
        PurgeUserCommand command;
        try {
            command = objectMapper.readValue(rawPayload, PurgeUserCommand.class);
        } catch (Exception e) {
            log.error("[{}] failed to parse purge command payload: {}", serviceName, e.getMessage(), e);
            return;
        }
        if (command.getTargetService() != null && !serviceName.equalsIgnoreCase(command.getTargetService())) {
            return;
        }
        PurgeUserResult.PurgeUserResultBuilder builder = PurgeUserResult.builder()
                .sagaId(command.getSagaId())
                .idempotencyKey(command.getIdempotencyKey())
                .userId(command.getUserId())
                .service(serviceName)
                .attempt(command.getAttempt())
                .completedAt(Instant.now());
        try {
            purge(command);
            publish(builder.status(PurgeUserResult.Status.SUCCEEDED).build());
        } catch (Exception e) {
            log.error("[{}] purge failed user={} saga={}: {}", serviceName,
                    command.getUserId(), command.getSagaId(), e.getMessage(), e);
            publish(builder.status(PurgeUserResult.Status.FAILED)
                    .errorMessage(safe(e.getMessage()))
                    .build());
        }
    }

    private void publish(PurgeUserResult result) {
        try {
            kafkaTemplate.send(AccountDeletionTopics.PURGE_RESULTS,
                    result.getSagaId(), result).get();
        } catch (Exception e) {
            log.error("[{}] failed to publish purge result: {}", serviceName, e.getMessage(), e);
        }
    }

    private static String safe(String s) {
        if (s == null) return null;
        return s.length() > 1000 ? s.substring(0, 1000) : s;
    }
}
