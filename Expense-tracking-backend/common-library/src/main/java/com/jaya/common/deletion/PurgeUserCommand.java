package com.jaya.common.deletion;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Kafka/in-memory command asking a participant service to purge (or anonymize) all
 * data owned by {@code userId}. Handlers MUST be idempotent: replays with the same
 * {@code idempotencyKey} must be no-ops after the first successful execution.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PurgeUserCommand {

    private String sagaId;
    private String idempotencyKey;
    private Integer userId;
    private String userEmail;
    private String targetService;
    private DeletionInitiator initiator;
    private Integer initiatorUserId;
    private String correlationId;
    private Instant requestedAt;
    private int attempt;
}
