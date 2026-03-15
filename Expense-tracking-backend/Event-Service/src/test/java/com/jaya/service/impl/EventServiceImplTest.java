package com.jaya.service.impl;

import com.jaya.dto.EventBudgetDTO;
import com.jaya.dto.EventDonationDTO;
import com.jaya.dto.EventDTO;
import com.jaya.dto.EventExpenseDTO;
import com.jaya.model.Event;
import com.jaya.model.EventBudget;
import com.jaya.model.EventDonation;
import com.jaya.model.EventExpense;
import com.jaya.repository.EventBudgetRepository;
import com.jaya.repository.EventDonationRepository;
import com.jaya.repository.EventExpenseRepository;
import com.jaya.repository.EventRepository;
import com.jaya.testutil.EventTestDataFactory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.atLeast;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EventServiceImplTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private EventExpenseRepository eventExpenseRepository;

    @Mock
    private EventDonationRepository eventDonationRepository;

    @Mock
    private EventBudgetRepository eventBudgetRepository;

    @InjectMocks
    private EventServiceImpl eventService;

    @Nested
    @DisplayName("createEvent")
    class CreateEvent {

        @Test
        @DisplayName("should create event with remainingBudget equal to totalBudget")
        void shouldCreateEventWithRemainingBudgetEqualToTotalBudget() {
            EventDTO dto = EventTestDataFactory.buildEventDTO();
            dto.setTotalBudget(BigDecimal.valueOf(100000));
            Event savedEvent = EventTestDataFactory.buildEvent();
            when(eventRepository.save(any(Event.class))).thenReturn(savedEvent);

            EventDTO result = eventService.createEvent(dto);

            ArgumentCaptor<Event> captor = ArgumentCaptor.forClass(Event.class);
            verify(eventRepository).save(captor.capture());
            Event captured = captor.getValue();
            assertThat(captured.getRemainingBudget()).isEqualByComparingTo(captured.getTotalBudget());
        }

        @Test
        @DisplayName("should set zero budget when null")
        void shouldSetZeroBudgetWhenNull() {
            EventDTO dto = EventTestDataFactory.buildEventDTO();
            dto.setTotalBudget(null);
            Event savedEvent = EventTestDataFactory.buildEvent();
            when(eventRepository.save(any(Event.class))).thenReturn(savedEvent);

            eventService.createEvent(dto);

            ArgumentCaptor<Event> captor = ArgumentCaptor.forClass(Event.class);
            verify(eventRepository).save(captor.capture());
            assertThat(captor.getValue().getTotalBudget()).isEqualByComparingTo(BigDecimal.ZERO);
        }
    }

    @Nested
    @DisplayName("updateEvent")
    class UpdateEvent {

        @Test
        @DisplayName("should update event fields")
        void shouldUpdateEventFields() {
            Event event = EventTestDataFactory.buildEvent();
            EventDTO dto = EventTestDataFactory.buildEventDTO();
            dto.setEventName("Updated Wedding");
            dto.setLocation("Grand Resort");
            when(eventRepository.findByIdAndUserId(1, EventTestDataFactory.TEST_USER_ID)).thenReturn(Optional.of(event));
            when(eventRepository.save(any(Event.class))).thenReturn(event);
            when(eventRepository.findById(1)).thenReturn(Optional.of(event));
            when(eventExpenseRepository.getTotalExpensesByEventId(1)).thenReturn(BigDecimal.ZERO);
            when(eventDonationRepository.getTotalDonationsByEventId(1)).thenReturn(BigDecimal.ZERO);
            when(eventBudgetRepository.getTotalBudgetByEventId(1)).thenReturn(BigDecimal.valueOf(100000));
            when(eventBudgetRepository.findByEventIdAndUserId(1, null)).thenReturn(Collections.emptyList());

            eventService.updateEvent(1, dto, EventTestDataFactory.TEST_USER_ID);

            ArgumentCaptor<Event> captor = ArgumentCaptor.forClass(Event.class);
            verify(eventRepository, times(2)).save(captor.capture());
            Event savedEvent = captor.getValue();
            assertThat(savedEvent.getEventName()).isEqualTo("Updated Wedding");
            assertThat(savedEvent.getLocation()).isEqualTo("Grand Resort");
        }

        @Test
        @DisplayName("should throw when event not found")
        void shouldThrowWhenEventNotFound() {
            when(eventRepository.findByIdAndUserId(1, EventTestDataFactory.TEST_USER_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> eventService.updateEvent(1, EventTestDataFactory.buildEventDTO(), EventTestDataFactory.TEST_USER_ID))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Event not found");
        }

        @Test
        @DisplayName("should call updateEventTotals")
        void shouldCallUpdateEventTotals() {
            Event event = EventTestDataFactory.buildEvent();
            when(eventRepository.findByIdAndUserId(1, EventTestDataFactory.TEST_USER_ID)).thenReturn(Optional.of(event));
            when(eventRepository.save(any(Event.class))).thenReturn(event);
            when(eventRepository.findById(1)).thenReturn(Optional.of(event));
            when(eventExpenseRepository.getTotalExpensesByEventId(1)).thenReturn(BigDecimal.ZERO);
            when(eventDonationRepository.getTotalDonationsByEventId(1)).thenReturn(BigDecimal.ZERO);
            when(eventBudgetRepository.getTotalBudgetByEventId(1)).thenReturn(BigDecimal.valueOf(100000));
            when(eventBudgetRepository.findByEventIdAndUserId(1, null)).thenReturn(Collections.emptyList());

            eventService.updateEvent(1, EventTestDataFactory.buildEventDTO(), EventTestDataFactory.TEST_USER_ID);

            verify(eventRepository).findById(1);
        }
    }

    @Nested
    @DisplayName("deleteEvent")
    class DeleteEvent {

        @Test
        @DisplayName("should delete existing event")
        void shouldDeleteExistingEvent() {
            Event event = EventTestDataFactory.buildEvent();
            when(eventRepository.findByIdAndUserId(1, EventTestDataFactory.TEST_USER_ID)).thenReturn(Optional.of(event));

            eventService.deleteEvent(1, EventTestDataFactory.TEST_USER_ID);

            verify(eventRepository).delete(event);
        }

        @Test
        @DisplayName("should throw when deleting nonexistent event")
        void shouldThrowWhenDeletingNonexistentEvent() {
            when(eventRepository.findByIdAndUserId(1, EventTestDataFactory.TEST_USER_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> eventService.deleteEvent(1, EventTestDataFactory.TEST_USER_ID))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Event not found");
        }
    }

    @Nested
    @DisplayName("addExpenseToEvent")
    class AddExpenseToEvent {

        @Test
        @DisplayName("should add expense and update totals")
        void shouldAddExpenseAndUpdateTotals() {
            Event event = EventTestDataFactory.buildEvent();
            EventExpenseDTO dto = EventTestDataFactory.buildEventExpenseDTO(1);
            EventExpense savedExpense = EventTestDataFactory.buildEventExpense(event);
            when(eventRepository.findById(1)).thenReturn(Optional.of(event));
            when(eventExpenseRepository.save(any(EventExpense.class))).thenReturn(savedExpense);

            EventExpenseDTO result = eventService.addExpenseToEvent(dto);

            assertThat(result.getExpenseName()).isEqualTo("Venue Booking");
            assertThat(result.getAmount()).isEqualByComparingTo(BigDecimal.valueOf(25000));
            verify(eventRepository, atLeast(1)).findById(1);
        }

        @Test
        @DisplayName("should throw when event not found for expense")
        void shouldThrowWhenEventNotFoundForExpense() {
            when(eventRepository.findById(1)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> eventService.addExpenseToEvent(EventTestDataFactory.buildEventExpenseDTO(1)))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Event not found");
        }
    }

    @Nested
    @DisplayName("updateEventExpense")
    class UpdateEventExpense {

        @Test
        @DisplayName("should update expense when owner")
        void shouldUpdateExpenseWhenOwner() {
            Event event = EventTestDataFactory.buildEvent();
            EventExpense expense = EventTestDataFactory.buildEventExpense(event);
            EventExpenseDTO dto = EventTestDataFactory.buildEventExpenseDTO(1);
            dto.setExpenseName("Updated Venue");
            when(eventExpenseRepository.findById(1)).thenReturn(Optional.of(expense));
            when(eventExpenseRepository.save(any(EventExpense.class))).thenReturn(expense);
            when(eventRepository.findById(1)).thenReturn(Optional.of(event));
            when(eventExpenseRepository.getTotalExpensesByEventId(1)).thenReturn(BigDecimal.ZERO);
            when(eventDonationRepository.getTotalDonationsByEventId(1)).thenReturn(BigDecimal.ZERO);
            when(eventBudgetRepository.getTotalBudgetByEventId(1)).thenReturn(BigDecimal.valueOf(100000));
            when(eventBudgetRepository.findByEventIdAndUserId(1, null)).thenReturn(Collections.emptyList());

            eventService.updateEventExpense(1, dto, EventTestDataFactory.TEST_USER_ID);

            verify(eventExpenseRepository).save(expense);
        }

        @Test
        @DisplayName("should throw when userId mismatch")
        void shouldThrowWhenUserIdMismatch() {
            Event event = EventTestDataFactory.buildEvent();
            EventExpense expense = EventTestDataFactory.buildEventExpense(event);
            when(eventExpenseRepository.findById(1)).thenReturn(Optional.of(expense));

            assertThatThrownBy(() -> eventService.updateEventExpense(1, EventTestDataFactory.buildEventExpenseDTO(1), EventTestDataFactory.OTHER_USER_ID))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Unauthorized access to expense");
        }
    }

    @Nested
    @DisplayName("deleteEventExpense")
    class DeleteEventExpense {

        @Test
        @DisplayName("should delete expense and update totals")
        void shouldDeleteExpenseAndUpdateTotals() {
            Event event = EventTestDataFactory.buildEvent();
            EventExpense expense = EventTestDataFactory.buildEventExpense(event);
            when(eventExpenseRepository.findById(1)).thenReturn(Optional.of(expense));
            when(eventRepository.findById(1)).thenReturn(Optional.of(event));
            when(eventExpenseRepository.getTotalExpensesByEventId(1)).thenReturn(BigDecimal.ZERO);
            when(eventDonationRepository.getTotalDonationsByEventId(1)).thenReturn(BigDecimal.ZERO);
            when(eventBudgetRepository.getTotalBudgetByEventId(1)).thenReturn(BigDecimal.valueOf(100000));
            when(eventBudgetRepository.findByEventIdAndUserId(1, null)).thenReturn(Collections.emptyList());

            eventService.deleteEventExpense(1, EventTestDataFactory.TEST_USER_ID);

            verify(eventExpenseRepository).delete(expense);
            verify(eventRepository).findById(1);
        }

        @Test
        @DisplayName("should throw when unauthorized")
        void shouldThrowWhenUnauthorized() {
            Event event = EventTestDataFactory.buildEvent();
            EventExpense expense = EventTestDataFactory.buildEventExpense(event);
            when(eventExpenseRepository.findById(1)).thenReturn(Optional.of(expense));

            assertThatThrownBy(() -> eventService.deleteEventExpense(1, EventTestDataFactory.OTHER_USER_ID))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Unauthorized access to expense");
        }
    }

    @Nested
    @DisplayName("getTotalExpensesByEvent")
    class GetTotalExpensesByEvent {

        @Test
        @DisplayName("should return sum when expenses exist")
        void shouldReturnSumWhenExpensesExist() {
            when(eventExpenseRepository.getTotalExpensesByEventId(1)).thenReturn(BigDecimal.valueOf(25000));

            BigDecimal result = eventService.getTotalExpensesByEvent(1);

            assertThat(result).isEqualByComparingTo(BigDecimal.valueOf(25000));
        }

        @Test
        @DisplayName("should return zero when no expenses")
        void shouldReturnZeroWhenNoExpenses() {
            when(eventExpenseRepository.getTotalExpensesByEventId(1)).thenReturn(null);

            BigDecimal result = eventService.getTotalExpensesByEvent(1);

            assertThat(result).isEqualByComparingTo(BigDecimal.ZERO);
        }
    }

    @Nested
    @DisplayName("updateEventTotals")
    class UpdateEventTotals {

        @Test
        @DisplayName("should recompute all totals")
        void shouldRecomputeAllTotals() {
            Event event = EventTestDataFactory.buildEvent();
            when(eventRepository.findById(1)).thenReturn(Optional.of(event));
            when(eventExpenseRepository.getTotalExpensesByEventId(1)).thenReturn(BigDecimal.valueOf(25000));
            when(eventDonationRepository.getTotalDonationsByEventId(1)).thenReturn(BigDecimal.valueOf(10000));
            when(eventBudgetRepository.getTotalBudgetByEventId(1)).thenReturn(BigDecimal.valueOf(100000));
            when(eventBudgetRepository.findByEventIdAndUserId(1, null)).thenReturn(Collections.emptyList());
            when(eventRepository.save(any(Event.class))).thenReturn(event);

            eventService.updateEventTotals(1);

            ArgumentCaptor<Event> captor = ArgumentCaptor.forClass(Event.class);
            verify(eventRepository).save(captor.capture());
            Event saved = captor.getValue();
            assertThat(saved.getTotalExpenses()).isEqualByComparingTo(BigDecimal.valueOf(25000));
            assertThat(saved.getTotalDonations()).isEqualByComparingTo(BigDecimal.valueOf(10000));
            assertThat(saved.getRemainingBudget()).isEqualByComparingTo(BigDecimal.valueOf(75000));
        }

        @Test
        @DisplayName("should update budget to zero when no budgets")
        void shouldUpdateBudgetToZeroWhenNoBudgets() {
            Event event = EventTestDataFactory.buildEvent();
            event.setTotalBudget(BigDecimal.ZERO);
            when(eventRepository.findById(1)).thenReturn(Optional.of(event));
            when(eventExpenseRepository.getTotalExpensesByEventId(1)).thenReturn(BigDecimal.valueOf(25000));
            when(eventDonationRepository.getTotalDonationsByEventId(1)).thenReturn(BigDecimal.ZERO);
            when(eventBudgetRepository.getTotalBudgetByEventId(1)).thenReturn(null);
            when(eventBudgetRepository.findByEventIdAndUserId(1, null)).thenReturn(Collections.emptyList());
            when(eventRepository.save(any(Event.class))).thenReturn(event);

            eventService.updateEventTotals(1);

            ArgumentCaptor<Event> captor = ArgumentCaptor.forClass(Event.class);
            verify(eventRepository).save(captor.capture());
            assertThat(captor.getValue().getRemainingBudget()).isEqualByComparingTo(BigDecimal.valueOf(-25000));
        }
    }

    @Nested
    @DisplayName("getEventAnalytics")
    class GetEventAnalytics {

        @Test
        @DisplayName("should calculate budget utilization")
        void shouldCalculateBudgetUtilization() {
            when(eventBudgetRepository.getTotalBudgetByEventId(1)).thenReturn(BigDecimal.valueOf(100000));
            when(eventExpenseRepository.getTotalExpensesByEventId(1)).thenReturn(BigDecimal.valueOf(50000));
            when(eventDonationRepository.getTotalDonationsByEventId(1)).thenReturn(BigDecimal.ZERO);
            when(eventExpenseRepository.getCategoryWiseExpenses(1)).thenReturn(Collections.emptyList());
            when(eventDonationRepository.getPaymentMethodWiseDonations(1)).thenReturn(Collections.emptyList());

            Map<String, Object> result = eventService.getEventAnalytics(1, EventTestDataFactory.TEST_USER_ID);

            assertThat((BigDecimal) result.get("budgetUtilization")).isEqualByComparingTo(new BigDecimal("50.0000"));
        }

        @Test
        @DisplayName("should handle zero budget without division error")
        void shouldHandleZeroBudgetWithoutDivisionError() {
            when(eventBudgetRepository.getTotalBudgetByEventId(1)).thenReturn(BigDecimal.ZERO);
            when(eventExpenseRepository.getTotalExpensesByEventId(1)).thenReturn(BigDecimal.ZERO);
            when(eventDonationRepository.getTotalDonationsByEventId(1)).thenReturn(BigDecimal.ZERO);
            when(eventExpenseRepository.getCategoryWiseExpenses(1)).thenReturn(Collections.emptyList());
            when(eventDonationRepository.getPaymentMethodWiseDonations(1)).thenReturn(Collections.emptyList());

            Map<String, Object> result = eventService.getEventAnalytics(1, EventTestDataFactory.TEST_USER_ID);

            assertThat((BigDecimal) result.get("budgetUtilization")).isEqualByComparingTo(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("should handle zero expenses for donation coverage")
        void shouldHandleZeroExpensesForDonationCoverage() {
            when(eventBudgetRepository.getTotalBudgetByEventId(1)).thenReturn(BigDecimal.ZERO);
            when(eventExpenseRepository.getTotalExpensesByEventId(1)).thenReturn(BigDecimal.ZERO);
            when(eventDonationRepository.getTotalDonationsByEventId(1)).thenReturn(BigDecimal.ZERO);
            when(eventExpenseRepository.getCategoryWiseExpenses(1)).thenReturn(Collections.emptyList());
            when(eventDonationRepository.getPaymentMethodWiseDonations(1)).thenReturn(Collections.emptyList());

            Map<String, Object> result = eventService.getEventAnalytics(1, EventTestDataFactory.TEST_USER_ID);

            assertThat((BigDecimal) result.get("donationCoverage")).isEqualByComparingTo(BigDecimal.ZERO);
        }
    }

    @Nested
    @DisplayName("getCategoryWiseExpenses")
    class GetCategoryWiseExpenses {

        @Test
        @DisplayName("should map results correctly")
        void shouldMapResultsCorrectly() {
            List<Object[]> results = List.of(
                    new Object[]{"Venue", BigDecimal.valueOf(25000)},
                    new Object[]{"Catering", BigDecimal.valueOf(15000)}
            );
            when(eventExpenseRepository.getCategoryWiseExpenses(1)).thenReturn(results);

            Map<String, BigDecimal> result = eventService.getCategoryWiseExpenses(1);

            assertThat(result).containsEntry("Venue", BigDecimal.valueOf(25000));
            assertThat(result).containsEntry("Catering", BigDecimal.valueOf(15000));
        }
    }

    @Nested
    @DisplayName("getEventStatusCounts")
    class GetEventStatusCounts {

        @Test
        @DisplayName("should return counts for all statuses")
        void shouldReturnCountsForAllStatuses() {
            for (Event.EventStatus status : Event.EventStatus.values()) {
                when(eventRepository.countByUserIdAndStatus(EventTestDataFactory.TEST_USER_ID, status)).thenReturn(1L);
            }

            Map<String, Long> result = eventService.getEventStatusCounts(EventTestDataFactory.TEST_USER_ID);

            for (Event.EventStatus status : Event.EventStatus.values()) {
                assertThat(result).containsKey(status.name());
            }
        }
    }

    @Nested
    @DisplayName("Donation CRUD authorization")
    class DonationAuthorization {

        @Test
        @DisplayName("should throw when donation userId mismatch")
        void shouldThrowWhenDonationUserIdMismatch() {
            Event event = EventTestDataFactory.buildEvent();
            EventDonation donation = EventTestDataFactory.buildEventDonation(event);
            when(eventDonationRepository.findById(1)).thenReturn(Optional.of(donation));

            assertThatThrownBy(() -> eventService.updateEventDonation(1, EventTestDataFactory.buildEventDonationDTO(1), EventTestDataFactory.OTHER_USER_ID))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Unauthorized access to donation");
        }
    }

    @Nested
    @DisplayName("Budget CRUD authorization")
    class BudgetAuthorization {

        @Test
        @DisplayName("should throw when budget userId mismatch")
        void shouldThrowWhenBudgetUserIdMismatch() {
            Event event = EventTestDataFactory.buildEvent();
            EventBudget budget = EventTestDataFactory.buildEventBudget(event);
            when(eventBudgetRepository.findById(1)).thenReturn(Optional.of(budget));

            assertThatThrownBy(() -> eventService.updateEventBudget(1, EventTestDataFactory.buildEventBudgetDTO(1), EventTestDataFactory.OTHER_USER_ID))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Unauthorized access to budget");
        }
    }

    @Nested
    @DisplayName("createEventBudget")
    class CreateEventBudget {

        @Test
        @DisplayName("should set remaining equal to allocated")
        void shouldSetRemainingEqualToAllocated() {
            Event event = EventTestDataFactory.buildEvent();
            EventBudgetDTO dto = EventTestDataFactory.buildEventBudgetDTO(1);
            EventBudget savedBudget = EventTestDataFactory.buildEventBudget(event);
            when(eventRepository.findById(1)).thenReturn(Optional.of(event));
            when(eventBudgetRepository.save(any(EventBudget.class))).thenReturn(savedBudget);
            when(eventExpenseRepository.getTotalExpensesByEventId(1)).thenReturn(BigDecimal.ZERO);
            when(eventDonationRepository.getTotalDonationsByEventId(1)).thenReturn(BigDecimal.ZERO);
            when(eventBudgetRepository.getTotalBudgetByEventId(1)).thenReturn(BigDecimal.valueOf(30000));
            when(eventBudgetRepository.findByEventIdAndUserId(1, null)).thenReturn(Collections.emptyList());

            EventBudgetDTO result = eventService.createEventBudget(dto);

            ArgumentCaptor<EventBudget> captor = ArgumentCaptor.forClass(EventBudget.class);
            verify(eventBudgetRepository).save(captor.capture());
            assertThat(captor.getValue().getRemainingAmount()).isEqualByComparingTo(captor.getValue().getAllocatedAmount());
        }
    }
}
