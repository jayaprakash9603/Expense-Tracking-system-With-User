package com.jaya.task.user.service.dto;

import com.jaya.task.user.service.modal.deletion.DeletionSaga;
import com.jaya.task.user.service.modal.deletion.DeletionStep;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeletionStatusResponse {

    private String correlationId;
    private Integer userId;
    private String state;
    private String initiator;
    private Integer initiatorUserId;
    private LocalDateTime requestedAt;
    private LocalDateTime scheduledPurgeAt;
    private LocalDateTime purgeStartedAt;
    private LocalDateTime completedAt;
    private LocalDateTime cancelledAt;
    private String failureReason;
    private boolean cancellable;
    private List<StepView> steps;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StepView {
        private String service;
        private String status;
        private int attempts;
        private String lastError;
        private LocalDateTime completedAt;
    }

    public static DeletionStatusResponse from(DeletionSaga saga) {
        List<StepView> steps = saga.getSteps() == null ? List.of() : saga.getSteps().stream()
                .map(s -> StepView.builder()
                        .service(s.getServiceName())
                        .status(s.getStatus().name())
                        .attempts(s.getAttemptCount())
                        .lastError(s.getLastError())
                        .completedAt(s.getCompletedAt())
                        .build())
                .toList();
        return DeletionStatusResponse.builder()
                .correlationId(saga.getCorrelationId())
                .userId(saga.getUserId())
                .state(saga.getState().name())
                .initiator(saga.getInitiator())
                .initiatorUserId(saga.getInitiatorUserId())
                .requestedAt(saga.getRequestedAt())
                .scheduledPurgeAt(saga.getScheduledPurgeAt())
                .purgeStartedAt(saga.getPurgeStartedAt())
                .completedAt(saga.getCompletedAt())
                .cancelledAt(saga.getCancelledAt())
                .failureReason(saga.getFailureReason())
                .cancellable(saga.isCancellable())
                .steps(steps)
                .build();
    }

    public static DeletionStatusResponse redactPii(DeletionStatusResponse full) {
        // Steps intentionally hide raw error strings from non-admin callers to
        // avoid leaking downstream PII in error payloads.
        List<StepView> redacted = full.getSteps() == null ? List.of() : full.getSteps().stream()
                .map(s -> StepView.builder()
                        .service(s.getService())
                        .status(s.getStatus())
                        .attempts(s.getAttempts())
                        .completedAt(s.getCompletedAt())
                        .build())
                .toList();
        full.setSteps(redacted);
        return full;
    }
}
