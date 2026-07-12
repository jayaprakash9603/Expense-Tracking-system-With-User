package com.jaya.task.user.service.service.deletion;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.jaya.common.deletion.DeletionInitiator;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountDeletionServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private DeletionSagaRepository sagaRepository;
    @Mock private DeletionStepRepository stepRepository;
    @Mock private DeletionOutboxRepository outboxRepository;

    private AccountDeletionProperties properties;
    private AccountDeletionService service;

    @BeforeEach
    void setUp() {
        properties = new AccountDeletionProperties();
        properties.setGracePeriod(Duration.ofDays(5));
        properties.setMaxAttempts(3);
        properties.setParticipants(List.of("user-service", "expense-service"));
        service = new AccountDeletionService(
                userRepository, sagaRepository, stepRepository, outboxRepository,
                properties, new ObjectMapper().registerModule(new JavaTimeModule()));

        lenient().when(sagaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        lenient().when(stepRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void requestDeletion_transitionsUserToPendingAndSchedulesPurge() {
        User user = newUser(42);
        when(userRepository.findById(42)).thenReturn(Optional.of(user));
        when(sagaRepository.findActiveByUserId(42)).thenReturn(Optional.empty());

        DeletionSaga saga = service.requestDeletion(42, DeletionInitiator.SELF, 42);

        assertThat(saga.getState()).isEqualTo(DeletionSaga.State.REQUESTED);
        assertThat(saga.getSteps()).hasSize(2);
        assertThat(user.getAccountStatus()).isEqualTo(AccountStatus.DELETION_PENDING);
        assertThat(saga.getScheduledPurgeAt())
                .isAfter(LocalDateTime.now().plusDays(4).plusHours(23));
        verify(outboxRepository, atLeastOnce()).save(any(DeletionOutbox.class));
    }

    @Test
    void requestDeletion_isIdempotentWhenActiveSagaExists() {
        User user = newUser(7);
        DeletionSaga existing = DeletionSaga.builder()
                .correlationId("abc").userId(7).state(DeletionSaga.State.REQUESTED)
                .initiator("SELF").requestedAt(LocalDateTime.now())
                .scheduledPurgeAt(LocalDateTime.now().plusDays(5))
                .build();
        when(userRepository.findById(7)).thenReturn(Optional.of(user));
        when(sagaRepository.findActiveByUserId(7)).thenReturn(Optional.of(existing));

        DeletionSaga saga = service.requestDeletion(7, DeletionInitiator.SELF, 7);
        assertThat(saga).isSameAs(existing);
        verify(sagaRepository, never()).save(any());
    }

    @Test
    void cancelDeletion_restoresActiveStatusWithinGrace() {
        User user = newUser(1);
        user.setAccountStatus(AccountStatus.DELETION_PENDING);
        DeletionSaga saga = DeletionSaga.builder()
                .correlationId("cid").userId(1).state(DeletionSaga.State.REQUESTED)
                .initiator("SELF").requestedAt(LocalDateTime.now())
                .scheduledPurgeAt(LocalDateTime.now().plusDays(5))
                .build();
        when(sagaRepository.findActiveByUserId(1)).thenReturn(Optional.of(saga));
        when(userRepository.findById(1)).thenReturn(Optional.of(user));

        DeletionSaga cancelled = service.cancelDeletion(1, 1);

        assertThat(cancelled.getState()).isEqualTo(DeletionSaga.State.CANCELLED);
        assertThat(user.getAccountStatus()).isEqualTo(AccountStatus.ACTIVE);
        assertThat(user.getDeletionCorrelationId()).isNull();
    }

    @Test
    void cancelDeletion_rejectsWhenAlreadyPurging() {
        DeletionSaga saga = DeletionSaga.builder()
                .correlationId("cid").userId(1).state(DeletionSaga.State.PURGING)
                .initiator("SELF").requestedAt(LocalDateTime.now())
                .scheduledPurgeAt(LocalDateTime.now().minusDays(1))
                .build();
        when(sagaRepository.findActiveByUserId(1)).thenReturn(Optional.of(saga));

        assertThatThrownBy(() -> service.cancelDeletion(1, 1))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void handleResult_marksSuccessAndFinalizesWhenAllStepsDone() {
        DeletionSaga saga = purgingSaga(9);
        DeletionStep step = saga.getSteps().get(0);
        // Second step already succeeded so this result should finalize the saga.
        saga.getSteps().get(1).setStatus(DeletionStep.Status.SUCCEEDED);
        when(stepRepository.findByIdempotencyKey(step.getIdempotencyKey())).thenReturn(Optional.of(step));
        User user = newUser(9);
        user.setAccountStatus(AccountStatus.PURGING);
        when(userRepository.findById(9)).thenReturn(Optional.of(user));

        service.handleResult(PurgeUserResult.builder()
                .idempotencyKey(step.getIdempotencyKey())
                .status(PurgeUserResult.Status.SUCCEEDED)
                .completedAt(Instant.now())
                .build());

        assertThat(saga.getState()).isEqualTo(DeletionSaga.State.COMPLETED);
        assertThat(user.getAccountStatus()).isEqualTo(AccountStatus.DELETED);
        assertThat(user.getEmail()).startsWith("deleted-");
        assertThat(user.getFullName()).isEqualTo("Deleted User");
    }

    @Test
    void handleResult_movesToFailedAfterMaxAttempts() {
        DeletionSaga saga = purgingSaga(11);
        DeletionStep step = saga.getSteps().get(0);
        step.setAttemptCount(properties.getMaxAttempts());
        // Second step already succeeded so a terminal failure here should
        // mark the whole saga FAILED.
        saga.getSteps().get(1).setStatus(DeletionStep.Status.SUCCEEDED);
        when(stepRepository.findByIdempotencyKey(step.getIdempotencyKey())).thenReturn(Optional.of(step));
        User user = newUser(11);
        when(userRepository.findById(11)).thenReturn(Optional.of(user));

        service.handleResult(PurgeUserResult.builder()
                .idempotencyKey(step.getIdempotencyKey())
                .status(PurgeUserResult.Status.FAILED)
                .errorMessage("boom")
                .completedAt(Instant.now())
                .build());

        assertThat(step.getStatus()).isEqualTo(DeletionStep.Status.FAILED);
        assertThat(saga.getState()).isEqualTo(DeletionSaga.State.FAILED);
        assertThat(user.getAccountStatus()).isEqualTo(AccountStatus.FAILED);
        // DLQ + failure lifecycle event should have been written.
        ArgumentCaptor<DeletionOutbox> captor = ArgumentCaptor.forClass(DeletionOutbox.class);
        verify(outboxRepository, Mockito.atLeast(2)).save(captor.capture());
        assertThat(captor.getAllValues())
                .anyMatch(o -> o.getTopic().equals("user.deletion.purge.dlq"));
    }

    private static User newUser(Integer id) {
        User u = new User();
        u.setId(id);
        u.setEmail("u" + id + "@ex.com");
        u.setFullName("User " + id);
        u.setAccountStatus(AccountStatus.ACTIVE);
        return u;
    }

    private DeletionSaga purgingSaga(Integer userId) {
        DeletionSaga saga = DeletionSaga.builder()
                .correlationId("cor-" + userId).userId(userId)
                .state(DeletionSaga.State.PURGING)
                .initiator("SELF").requestedAt(LocalDateTime.now().minusDays(5))
                .scheduledPurgeAt(LocalDateTime.now().minusMinutes(1))
                .build();
        DeletionStep step1 = DeletionStep.builder()
                .saga(saga).serviceName("user-service")
                .idempotencyKey("cor-" + userId + ":user-service")
                .status(DeletionStep.Status.IN_FLIGHT).attemptCount(1)
                .build();
        DeletionStep step2 = DeletionStep.builder()
                .saga(saga).serviceName("expense-service")
                .idempotencyKey("cor-" + userId + ":expense-service")
                .status(DeletionStep.Status.IN_FLIGHT).attemptCount(1)
                .build();
        saga.getSteps().add(step1);
        saga.getSteps().add(step2);
        return saga;
    }
}
