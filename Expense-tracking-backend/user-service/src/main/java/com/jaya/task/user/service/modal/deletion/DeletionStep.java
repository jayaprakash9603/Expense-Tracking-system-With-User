package com.jaya.task.user.service.modal.deletion;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;

/**
 * Per-participant purge step. One row per (saga, service). The
 * {@code idempotencyKey} is the identity the participant service uses to
 * detect duplicate deliveries.
 */
@Entity
@Table(name = "deletion_step", uniqueConstraints = {
        @UniqueConstraint(name = "uk_deletion_step_saga_service", columnNames = {"saga_id", "service_name"})
}, indexes = {
        @Index(name = "idx_deletion_step_status", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "saga")
public class DeletionStep {

    public enum Status {
        PENDING,
        IN_FLIGHT,
        SUCCEEDED,
        FAILED,
        SKIPPED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "saga_id", nullable = false)
    private DeletionSaga saga;

    @Column(name = "service_name", nullable = false, length = 64)
    private String serviceName;

    @Column(name = "idempotency_key", nullable = false, unique = true, length = 96)
    private String idempotencyKey;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    private Status status;

    @Column(name = "attempt_count", nullable = false)
    private int attemptCount;

    @Column(name = "last_error", length = 1024)
    private String lastError;

    @Column(name = "next_attempt_at")
    private LocalDateTime nextAttemptAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Version
    @Column(name = "lock_version")
    private Long lockVersion;
}
