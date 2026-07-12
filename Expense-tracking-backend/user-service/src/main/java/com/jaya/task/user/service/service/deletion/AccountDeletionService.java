package com.jaya.task.user.service.service.deletion;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.common.deletion.AccountDeletionTopics;
import com.jaya.common.deletion.DeletionInitiator;
import com.jaya.common.deletion.PurgeUserCommand;
import com.jaya.common.deletion.PurgeUserResult;
import com.jaya.task.user.service.config.AccountDeletionProperties;
import com.jaya.task.user.service.modal.AccountStatus;
import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.modal.deletion.DeletionOutbox;
import com.jaya.task.user.service.modal.deletion.DeletionSaga;
import com.jaya.task.user.service.modal.deletion.DeletionStep;
import com.jaya.task.user.service.repository.UserRepository;
import com.jaya.task.user.service.repository.deletion.DeletionOutboxRepository;
import com.jaya.task.user.service.repository.deletion.DeletionSagaRepository;
import com.jaya.task.user.service.repository.deletion.DeletionStepRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Orchestrator for the five-day account-deletion saga. All state changes go
 * through this service; controllers, schedulers, and Kafka listeners are thin
 * adapters. Every mutation is wrapped in a database transaction that also
 * writes to {@link DeletionOutbox} so publications survive a broker outage.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AccountDeletionService {

    private final UserRepository userRepository;
    private final DeletionSagaRepository sagaRepository;
    private final DeletionStepRepository stepRepository;
    private final DeletionOutboxRepository outboxRepository;
    private final AccountDeletionProperties properties;
    private final ObjectMapper objectMapper;

    /** Idempotent request-deletion entry point (self or admin). */
    @Transactional
    public DeletionSaga requestDeletion(Integer userId, DeletionInitiator initiator, Integer initiatorUserId) {
        requireEnabled();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        Optional<DeletionSaga> existing = sagaRepository.findActiveByUserId(userId);
        if (existing.isPresent()) {
            return existing.get();
        }
        if (user.getAccountStatus() == AccountStatus.DELETED) {
            throw new IllegalStateException("Account already deleted");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime purgeAt = now.plus(properties.getGracePeriod());
        String correlationId = UUID.randomUUID().toString();

        DeletionSaga saga = DeletionSaga.builder()
                .correlationId(correlationId)
                .userId(userId)
                .userEmail(user.getEmail())
                .state(DeletionSaga.State.REQUESTED)
                .initiator(initiator.name())
                .initiatorUserId(initiatorUserId)
                .requestedAt(now)
                .scheduledPurgeAt(purgeAt)
                .build();

        for (String participant : properties.getParticipants()) {
            DeletionStep step = DeletionStep.builder()
                    .saga(saga)
                    .serviceName(participant)
                    .idempotencyKey(correlationId + ":" + participant)
                    .status(DeletionStep.Status.PENDING)
                    .attemptCount(0)
                    .build();
            saga.getSteps().add(step);
        }
        saga = sagaRepository.save(saga);

        user.setAccountStatus(AccountStatus.DELETION_PENDING);
        user.setDeletionInitiator(initiator.name());
        user.setDeletionInitiatorUserId(initiatorUserId);
        user.setDeletionRequestedAt(now);
        user.setDeletionScheduledPurgeAt(purgeAt);
        user.setDeletionCorrelationId(correlationId);
        userRepository.save(user);

        writeLifecycleEvent("REQUESTED", saga);
        log.info("Account deletion requested user={} initiator={} correlationId={} purgeAt={}",
                userId, initiator, correlationId, purgeAt);
        return saga;
    }

    /** Cancels an in-grace-period deletion. No-op if already terminal. */
    @Transactional
    public DeletionSaga cancelDeletion(Integer userId, Integer cancelledBy) {
        DeletionSaga saga = sagaRepository.findActiveByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("No pending deletion for user " + userId));
        if (!saga.isCancellable()) {
            throw new IllegalStateException("Deletion for user " + userId +
                    " can no longer be cancelled (state=" + saga.getState() + ")");
        }

        saga.setState(DeletionSaga.State.CANCELLED);
        saga.setCancelledAt(LocalDateTime.now());
        saga.setCancelledBy(cancelledBy);
        sagaRepository.save(saga);

        userRepository.findById(userId).ifPresent(u -> {
            u.setAccountStatus(AccountStatus.ACTIVE);
            u.setDeletionInitiator(null);
            u.setDeletionInitiatorUserId(null);
            u.setDeletionRequestedAt(null);
            u.setDeletionScheduledPurgeAt(null);
            u.setDeletionCorrelationId(null);
            userRepository.save(u);
        });

        writeLifecycleEvent("CANCELLED", saga);
        log.info("Account deletion cancelled user={} correlationId={} cancelledBy={}",
                userId, saga.getCorrelationId(), cancelledBy);
        return saga;
    }

    /** Called by the scheduler once the grace period elapses. */
    @Transactional
    public void beginPurge(DeletionSaga saga) {
        if (saga.getState() != DeletionSaga.State.REQUESTED) {
            return;
        }
        saga.setState(DeletionSaga.State.PURGING);
        saga.setPurgeStartedAt(LocalDateTime.now());
        sagaRepository.save(saga);

        userRepository.findById(saga.getUserId()).ifPresent(u -> {
            u.setAccountStatus(AccountStatus.PURGING);
            userRepository.save(u);
        });

        for (DeletionStep step : saga.getSteps()) {
            if (step.getStatus() == DeletionStep.Status.PENDING) {
                dispatchStep(saga, step);
            }
        }
        writeLifecycleEvent("PURGING", saga);
    }

    /** Consumes a purge result reported by a participant service. */
    @Transactional
    public void handleResult(PurgeUserResult result) {
        Optional<DeletionStep> stepOpt = stepRepository.findByIdempotencyKey(result.getIdempotencyKey());
        if (stepOpt.isEmpty()) {
            log.warn("Received purge result for unknown idempotencyKey={}", result.getIdempotencyKey());
            return;
        }
        DeletionStep step = stepOpt.get();
        DeletionSaga saga = step.getSaga();

        switch (result.getStatus()) {
            case SUCCEEDED, SKIPPED -> {
                step.setStatus(result.getStatus() == PurgeUserResult.Status.SKIPPED
                        ? DeletionStep.Status.SKIPPED
                        : DeletionStep.Status.SUCCEEDED);
                step.setCompletedAt(LocalDateTime.now());
                step.setLastError(null);
            }
            case FAILED -> {
                step.setLastError(result.getErrorMessage());
                if (step.getAttemptCount() >= properties.getMaxAttempts()) {
                    step.setStatus(DeletionStep.Status.FAILED);
                    step.setCompletedAt(LocalDateTime.now());
                    routeToDlq(saga, step, result);
                } else {
                    step.setStatus(DeletionStep.Status.PENDING);
                    step.setNextAttemptAt(LocalDateTime.now().plus(nextBackoff(step.getAttemptCount())));
                }
            }
        }
        stepRepository.save(step);
        recomputeSagaState(saga);
    }

    /** Scheduler hook to retry stalled steps. */
    @Transactional
    public void retryPendingSteps(DeletionSaga saga) {
        LocalDateTime now = LocalDateTime.now();
        for (DeletionStep step : saga.getSteps()) {
            if (step.getStatus() == DeletionStep.Status.PENDING
                    && (step.getNextAttemptAt() == null || !step.getNextAttemptAt().isAfter(now))
                    && step.getAttemptCount() > 0) {
                dispatchStep(saga, step);
            }
        }
    }

    /** Admin-only manual retry for FAILED sagas. */
    @Transactional
    public DeletionSaga adminRetry(Integer userId) {
        DeletionSaga saga = sagaRepository.findActiveByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("No saga for user " + userId));
        if (saga.getState() != DeletionSaga.State.FAILED) {
            throw new IllegalStateException("Only FAILED sagas can be retried (state=" + saga.getState() + ")");
        }
        saga.setState(DeletionSaga.State.PURGING);
        saga.setFailureReason(null);
        sagaRepository.save(saga);
        for (DeletionStep step : saga.getSteps()) {
            if (step.getStatus() == DeletionStep.Status.FAILED) {
                step.setStatus(DeletionStep.Status.PENDING);
                step.setNextAttemptAt(LocalDateTime.now());
                stepRepository.save(step);
                dispatchStep(saga, step);
            }
        }
        writeLifecycleEvent("ADMIN_RETRY", saga);
        return saga;
    }

    public Optional<DeletionSaga> getActiveSaga(Integer userId) {
        return sagaRepository.findActiveByUserId(userId);
    }

    private void dispatchStep(DeletionSaga saga, DeletionStep step) {
        step.setStatus(DeletionStep.Status.IN_FLIGHT);
        step.setAttemptCount(step.getAttemptCount() + 1);
        step.setStartedAt(LocalDateTime.now());
        stepRepository.save(step);

        PurgeUserCommand command = PurgeUserCommand.builder()
                .sagaId(saga.getCorrelationId())
                .idempotencyKey(step.getIdempotencyKey())
                .userId(saga.getUserId())
                .userEmail(saga.getUserEmail())
                .targetService(step.getServiceName())
                .initiator(DeletionInitiator.valueOf(saga.getInitiator()))
                .initiatorUserId(saga.getInitiatorUserId())
                .correlationId(saga.getCorrelationId())
                .requestedAt(saga.getRequestedAt().toInstant(ZoneOffset.UTC))
                .attempt(step.getAttemptCount())
                .build();

        writeOutbox(AccountDeletionTopics.PURGE_COMMANDS, step.getServiceName(), command);
    }

    private void recomputeSagaState(DeletionSaga saga) {
        boolean anyPending = false;
        boolean anyFailed = false;
        for (DeletionStep step : saga.getSteps()) {
            if (step.getStatus() == DeletionStep.Status.PENDING
                    || step.getStatus() == DeletionStep.Status.IN_FLIGHT) {
                anyPending = true;
            } else if (step.getStatus() == DeletionStep.Status.FAILED) {
                anyFailed = true;
            }
        }
        if (anyPending) {
            return;
        }
        if (anyFailed) {
            saga.setState(DeletionSaga.State.FAILED);
            saga.setFailureReason("One or more participants exhausted retries");
            sagaRepository.save(saga);
            userRepository.findById(saga.getUserId()).ifPresent(u -> {
                u.setAccountStatus(AccountStatus.FAILED);
                userRepository.save(u);
            });
            writeLifecycleEvent("FAILED", saga);
            return;
        }
        finalizeSaga(saga);
    }

    private void finalizeSaga(DeletionSaga saga) {
        saga.setState(DeletionSaga.State.COMPLETED);
        saga.setCompletedAt(LocalDateTime.now());
        sagaRepository.save(saga);

        // At this point every participant (including user-service's own step) has
        // purged owned data. Anonymize and mark the identity DELETED; the row is
        // kept for foreign-key/audit stability but stripped of PII.
        userRepository.findById(saga.getUserId()).ifPresent(u -> {
            u.setAccountStatus(AccountStatus.DELETED);
            u.setEmail("deleted-" + u.getId() + "@invalid.local");
            u.setFullName("Deleted User");
            u.setFirstName(null);
            u.setLastName(null);
            u.setPassword(null);
            u.setPhoneNumber(null);
            u.setMobile(null);
            u.setBio(null);
            u.setProfileImage(null);
            u.setCoverImage(null);
            u.setLocation(null);
            u.setWebsite(null);
            u.setOccupation(null);
            u.setDateOfBirth(null);
            u.setOauthProfileImage(null);
            u.setProviderId(null);
            u.setMfaSecret(null);
            u.setMfaBackupCodes(null);
            u.setUsername("deleted-" + u.getId());
            userRepository.save(u);
        });
        writeLifecycleEvent("COMPLETED", saga);
        log.info("Account deletion completed user={} correlationId={}",
                saga.getUserId(), saga.getCorrelationId());
    }

    private Duration nextBackoff(int attempt) {
        long base = properties.getRetryBaseDelay().toMillis();
        long capped = properties.getRetryMaxDelay().toMillis();
        long delay = Math.min(capped, base * (1L << Math.min(attempt, 20)));
        return Duration.ofMillis(delay);
    }

    private void routeToDlq(DeletionSaga saga, DeletionStep step, PurgeUserResult result) {
        writeOutbox(AccountDeletionTopics.PURGE_DLQ, step.getServiceName(), result);
        log.error("Purge step routed to DLQ saga={} service={} error={}",
                saga.getCorrelationId(), step.getServiceName(), result.getErrorMessage());
    }

    private void writeLifecycleEvent(String eventType, DeletionSaga saga) {
        writeOutbox(AccountDeletionTopics.LIFECYCLE_EVENTS, saga.getCorrelationId(),
                new LifecycleEvent(eventType, saga.getCorrelationId(), saga.getUserId(),
                        saga.getState().name(), Instant.now()));
    }

    private void writeOutbox(String topic, String key, Object payload) {
        try {
            String json = objectMapper.writeValueAsString(payload);
            DeletionOutbox entry = DeletionOutbox.builder()
                    .aggregateId(key == null ? "unknown" : key)
                    .topic(topic)
                    .messageKey(key)
                    .payload(json)
                    .createdAt(LocalDateTime.now())
                    .nextAttemptAt(LocalDateTime.now())
                    .attemptCount(0)
                    .build();
            outboxRepository.save(entry);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize deletion outbox payload", e);
        }
    }

    private void requireEnabled() {
        if (!properties.isSagaEnabled()) {
            throw new IllegalStateException("Account deletion saga is disabled by feature flag");
        }
    }

    public record LifecycleEvent(String eventType, String correlationId, Integer userId,
                                 String sagaState, Instant occurredAt) {}
}
