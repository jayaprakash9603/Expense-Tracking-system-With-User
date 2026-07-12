package com.jaya.task.user.service.service.deletion;

import com.jaya.task.user.service.config.AccountDeletionProperties;
import com.jaya.task.user.service.modal.deletion.DeletionSaga;
import com.jaya.task.user.service.repository.deletion.DeletionSagaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DeletionScheduler {

    private final DeletionSagaRepository sagaRepository;
    private final AccountDeletionService accountDeletionService;
    private final AccountDeletionProperties properties;

    /**
     * Fixed-delay tick that claims REQUESTED sagas whose grace period has
     * elapsed and drives retry of pending steps. Guarded by the feature flag.
     */
    @Scheduled(fixedDelayString = "${account-deletion.scheduler-interval-ms:60000}")
    @Transactional
    public void tick() {
        if (!properties.isSagaEnabled()) {
            return;
        }
        LocalDateTime cutoff = LocalDateTime.now();
        List<DeletionSaga> due = sagaRepository.claimDueSagas(cutoff);
        for (DeletionSaga saga : due) {
            try {
                accountDeletionService.beginPurge(saga);
            } catch (RuntimeException e) {
                log.error("Failed to begin purge for saga {}: {}", saga.getCorrelationId(), e.getMessage(), e);
            }
        }
        for (DeletionSaga saga : sagaRepository.findTop50ByStateOrderByRequestedAtAsc(DeletionSaga.State.PURGING)) {
            try {
                accountDeletionService.retryPendingSteps(saga);
            } catch (RuntimeException e) {
                log.error("Failed to retry saga {}: {}", saga.getCorrelationId(), e.getMessage(), e);
            }
        }
    }
}
