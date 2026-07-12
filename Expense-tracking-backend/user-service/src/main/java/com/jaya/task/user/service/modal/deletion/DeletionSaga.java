package com.jaya.task.user.service.modal.deletion;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Aggregate root for a five-day account-deletion request. One row per
 * lifecycle instance; a user may have multiple over their lifetime, but at
 * most one open (non-terminal) saga at any given moment.
 */
@Entity
@Table(name = "deletion_saga", indexes = {
        @Index(name = "idx_deletion_saga_user_id", columnList = "user_id"),
        @Index(name = "idx_deletion_saga_state_purge_at", columnList = "state, scheduled_purge_at"),
        @Index(name = "idx_deletion_saga_correlation", columnList = "correlation_id", unique = true)
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeletionSaga {

    public enum State {
        REQUESTED,
        CANCELLED,
        PURGING,
        COMPLETED,
        FAILED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "correlation_id", nullable = false, unique = true, length = 64)
    private String correlationId;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "user_email")
    private String userEmail;

    @Enumerated(EnumType.STRING)
    @Column(name = "state", nullable = false, length = 32)
    private State state;

    @Column(name = "initiator", nullable = false, length = 16)
    private String initiator;

    @Column(name = "initiator_user_id")
    private Integer initiatorUserId;

    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt;

    @Column(name = "scheduled_purge_at", nullable = false)
    private LocalDateTime scheduledPurgeAt;

    @Column(name = "purge_started_at")
    private LocalDateTime purgeStartedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancelled_by")
    private Integer cancelledBy;

    @Column(name = "failure_reason", length = 1024)
    private String failureReason;

    @Version
    @Column(name = "lock_version")
    private Long lockVersion;

    @OneToMany(mappedBy = "saga", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<DeletionStep> steps = new ArrayList<>();

    public boolean isTerminal() {
        return state == State.CANCELLED || state == State.COMPLETED;
    }

    public boolean isCancellable() {
        return state == State.REQUESTED;
    }
}
