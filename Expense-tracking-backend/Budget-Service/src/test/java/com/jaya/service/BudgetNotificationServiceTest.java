package com.jaya.service;

import com.jaya.dto.BudgetNotificationEvent;
import com.jaya.kafka.producer.BudgetNotificationProducer;
import com.jaya.models.Budget;
import com.jaya.testutil.BudgetTestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BudgetNotificationServiceTest {

    @Mock
    private BudgetNotificationProducer producer;

    @InjectMocks
    private BudgetNotificationService notificationService;

    private Budget testBudget;

    @BeforeEach
    void setUp() {
        testBudget = BudgetTestDataFactory.buildBudget();
    }

    @Nested
    @DisplayName("sendBudgetCreatedNotification")
    class SendBudgetCreatedNotification {

        @Test
        @DisplayName("should send create event with correct fields")
        void shouldSendCreateEvent() {
            notificationService.sendBudgetCreatedNotification(testBudget);

            ArgumentCaptor<BudgetNotificationEvent> captor = ArgumentCaptor.forClass(BudgetNotificationEvent.class);
            verify(producer).sendEvent(captor.capture());

            BudgetNotificationEvent event = captor.getValue();
            assertThat(event.getAction()).isEqualTo(BudgetNotificationEvent.CREATE);
            assertThat(event.getBudgetId()).isEqualTo(testBudget.getId());
            assertThat(event.getUserId()).isEqualTo(testBudget.getUserId());
            assertThat(event.getBudgetName()).isEqualTo(testBudget.getName());
            assertThat(event.getAmount()).isEqualTo(testBudget.getAmount());
            assertThat(event.getPercentageUsed()).isEqualTo(0.0);
        }

        @Test
        @DisplayName("should send contextual create event for friend creation")
        void shouldSendContextualCreateEvent() {
            notificationService.sendBudgetCreatedNotification(testBudget, 99, true);

            ArgumentCaptor<BudgetNotificationEvent> captor = ArgumentCaptor.forClass(BudgetNotificationEvent.class);
            verify(producer).sendEvent(captor.capture());

            BudgetNotificationEvent event = captor.getValue();
            assertThat(event.getAction()).isEqualTo(BudgetNotificationEvent.CREATE);
            assertThat(event.getMetadata()).containsKey("created_by_user_id");
            assertThat(event.getMetadata().get("creation_type")).isEqualTo("FRIEND_CREATED");
        }

        @Test
        @DisplayName("should send contextual create event for self creation")
        void shouldSendSelfCreateEvent() {
            notificationService.sendBudgetCreatedNotification(
                    testBudget, BudgetTestDataFactory.TEST_USER_ID, false);

            ArgumentCaptor<BudgetNotificationEvent> captor = ArgumentCaptor.forClass(BudgetNotificationEvent.class);
            verify(producer).sendEvent(captor.capture());

            BudgetNotificationEvent event = captor.getValue();
            assertThat(event.getMetadata().get("creation_type")).isEqualTo("SELF_CREATED");
        }

        @Test
        @DisplayName("should not propagate exception from producer")
        void shouldNotPropagateException() {
            doThrow(new RuntimeException("Kafka down")).when(producer).sendEvent(any());

            notificationService.sendBudgetCreatedNotification(testBudget);
        }
    }

    @Nested
    @DisplayName("sendBudgetUpdatedNotification")
    class SendBudgetUpdatedNotification {

        @Test
        @DisplayName("should send update event")
        void shouldSendUpdateEvent() {
            notificationService.sendBudgetUpdatedNotification(testBudget);

            ArgumentCaptor<BudgetNotificationEvent> captor = ArgumentCaptor.forClass(BudgetNotificationEvent.class);
            verify(producer).sendEvent(captor.capture());

            BudgetNotificationEvent event = captor.getValue();
            assertThat(event.getAction()).isEqualTo(BudgetNotificationEvent.UPDATE);
            assertThat(event.getBudgetId()).isEqualTo(testBudget.getId());
            assertThat(event.getBudgetName()).isEqualTo(testBudget.getName());
        }
    }

    @Nested
    @DisplayName("sendBudgetDeletedNotification")
    class SendBudgetDeletedNotification {

        @Test
        @DisplayName("should send delete event with correct fields")
        void shouldSendDeleteEvent() {
            notificationService.sendBudgetDeletedNotification(100, "Monthly Groceries", 1);

            ArgumentCaptor<BudgetNotificationEvent> captor = ArgumentCaptor.forClass(BudgetNotificationEvent.class);
            verify(producer).sendEvent(captor.capture());

            BudgetNotificationEvent event = captor.getValue();
            assertThat(event.getAction()).isEqualTo(BudgetNotificationEvent.DELETE);
            assertThat(event.getBudgetId()).isEqualTo(100);
            assertThat(event.getBudgetName()).isEqualTo("Monthly Groceries");
            assertThat(event.getUserId()).isEqualTo(1);
        }

        @Test
        @DisplayName("should not propagate exception from producer")
        void shouldNotPropagateException() {
            doThrow(new RuntimeException("Kafka down")).when(producer).sendEvent(any());

            notificationService.sendBudgetDeletedNotification(100, "Budget", 1);
        }
    }

    @Nested
    @DisplayName("sendBudgetExceededNotification")
    class SendBudgetExceededNotification {

        @Test
        @DisplayName("should send exceeded event with alert metadata")
        void shouldSendExceededEvent() {
            BigDecimal spent = BigDecimal.valueOf(6000.0);

            notificationService.sendBudgetExceededNotification(testBudget, spent);

            ArgumentCaptor<BudgetNotificationEvent> captor = ArgumentCaptor.forClass(BudgetNotificationEvent.class);
            verify(producer).sendEvent(captor.capture());

            BudgetNotificationEvent event = captor.getValue();
            assertThat(event.getAction()).isEqualTo(BudgetNotificationEvent.EXCEEDED);
            assertThat(event.getSpentAmount()).isEqualTo(spent);
            assertThat(event.getPercentageUsed()).isGreaterThan(100.0);
            assertThat(event.getMetadata()).containsKey("alertLevel");
            assertThat(event.getMetadata().get("alertLevel")).isEqualTo("CRITICAL");
        }
    }

    @Nested
    @DisplayName("sendBudgetWarningNotification")
    class SendBudgetWarningNotification {

        @Test
        @DisplayName("should send warning event with correct percentage")
        void shouldSendWarningEvent() {
            BigDecimal spent = BigDecimal.valueOf(4500.0);

            notificationService.sendBudgetWarningNotification(testBudget, spent);

            ArgumentCaptor<BudgetNotificationEvent> captor = ArgumentCaptor.forClass(BudgetNotificationEvent.class);
            verify(producer).sendEvent(captor.capture());

            BudgetNotificationEvent event = captor.getValue();
            assertThat(event.getAction()).isEqualTo(BudgetNotificationEvent.WARNING);
            assertThat(event.getPercentageUsed()).isEqualTo(90.0);
            assertThat(event.getMetadata().get("alertLevel")).isEqualTo("HIGH");
        }
    }

    @Nested
    @DisplayName("sendBudgetLimitApproachingNotification")
    class SendBudgetLimitApproachingNotification {

        @Test
        @DisplayName("should send limit approaching event")
        void shouldSendLimitApproachingEvent() {
            BigDecimal spent = BigDecimal.valueOf(2500.0);

            notificationService.sendBudgetLimitApproachingNotification(testBudget, spent);

            ArgumentCaptor<BudgetNotificationEvent> captor = ArgumentCaptor.forClass(BudgetNotificationEvent.class);
            verify(producer).sendEvent(captor.capture());

            BudgetNotificationEvent event = captor.getValue();
            assertThat(event.getAction()).isEqualTo(BudgetNotificationEvent.LIMIT_APPROACHING);
            assertThat(event.getPercentageUsed()).isEqualTo(50.0);
            assertThat(event.getMetadata().get("alertLevel")).isEqualTo("LOW");
        }
    }
}
