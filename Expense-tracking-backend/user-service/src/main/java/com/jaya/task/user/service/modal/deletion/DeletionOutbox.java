package com.jaya.task.user.service.modal.deletion;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Transactional-outbox entry. Written in the same DB transaction that
 * mutates saga/step state; a background publisher relays it to Kafka and
 * only marks {@code published_at} once the broker acks.
 */
@Entity
@Table(name = "deletion_outbox", indexes = {
        @Index(name = "idx_deletion_outbox_pending", columnList = "published_at, next_attempt_at")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeletionOutbox {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "aggregate_id", nullable = false, length = 64)
    private String aggregateId;

    @Column(name = "topic", nullable = false, length = 128)
    private String topic;

    @Column(name = "message_key", length = 128)
    private String messageKey;

    @Lob
    @Column(name = "payload", nullable = false, columnDefinition = "LONGTEXT")
    private String payload;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "next_attempt_at", nullable = false)
    private LocalDateTime nextAttemptAt;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "attempt_count", nullable = false)
    private int attemptCount;

    @Column(name = "last_error", length = 1024)
    private String lastError;
}
