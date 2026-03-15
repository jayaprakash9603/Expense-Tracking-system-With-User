package com.jaya.testutil;

import com.jaya.dto.EventBudgetDTO;
import com.jaya.dto.EventDonationDTO;
import com.jaya.dto.EventDTO;
import com.jaya.dto.EventExpenseDTO;
import com.jaya.model.Event;
import com.jaya.model.EventBudget;
import com.jaya.model.EventDonation;
import com.jaya.model.EventExpense;

import java.math.BigDecimal;
import java.time.LocalDate;

public final class EventTestDataFactory {

    public static final Integer TEST_USER_ID = 1;
    public static final Integer OTHER_USER_ID = 2;

    private EventTestDataFactory() {
    }

    public static Event buildEvent() {
        LocalDate today = LocalDate.now();
        Event event = new Event();
        event.setId(1);
        event.setEventName("Wedding Celebration");
        event.setEventType(Event.EventType.WEDDING);
        event.setStatus(Event.EventStatus.PLANNING);
        event.setStartDate(today);
        event.setEndDate(today.plusDays(7));
        event.setUserId(TEST_USER_ID);
        event.setTotalBudget(BigDecimal.valueOf(100000));
        event.setTotalExpenses(BigDecimal.ZERO);
        event.setTotalDonations(BigDecimal.ZERO);
        event.setRemainingBudget(BigDecimal.valueOf(100000));
        event.setLocation("City Hall");
        event.setExpectedGuests(200);
        return event;
    }

    public static EventDTO buildEventDTO() {
        LocalDate today = LocalDate.now();
        EventDTO dto = new EventDTO();
        dto.setId(1);
        dto.setEventName("Wedding Celebration");
        dto.setEventType(Event.EventType.WEDDING);
        dto.setStatus(Event.EventStatus.PLANNING);
        dto.setStartDate(today);
        dto.setEndDate(today.plusDays(7));
        dto.setUserId(TEST_USER_ID);
        dto.setTotalBudget(BigDecimal.valueOf(100000));
        dto.setTotalExpenses(BigDecimal.ZERO);
        dto.setTotalDonations(BigDecimal.ZERO);
        dto.setRemainingBudget(BigDecimal.valueOf(100000));
        dto.setLocation("City Hall");
        dto.setExpectedGuests(200);
        return dto;
    }

    public static EventExpense buildEventExpense(Event event) {
        EventExpense expense = new EventExpense();
        expense.setId(1);
        expense.setEvent(event);
        expense.setExpenseName("Venue Booking");
        expense.setAmount(BigDecimal.valueOf(25000));
        expense.setCategory("Venue");
        expense.setPaymentMethod("Bank Transfer");
        expense.setUserId(TEST_USER_ID);
        expense.setExpenseDate(LocalDate.now());
        return expense;
    }

    public static EventExpenseDTO buildEventExpenseDTO(Integer eventId) {
        EventExpenseDTO dto = new EventExpenseDTO();
        dto.setId(1);
        dto.setEventId(eventId);
        dto.setExpenseName("Venue Booking");
        dto.setAmount(BigDecimal.valueOf(25000));
        dto.setCategory("Venue");
        dto.setPaymentMethod("Bank Transfer");
        dto.setUserId(TEST_USER_ID);
        dto.setExpenseDate(LocalDate.now());
        return dto;
    }

    public static EventDonation buildEventDonation(Event event) {
        EventDonation donation = new EventDonation();
        donation.setId(1);
        donation.setEvent(event);
        donation.setDonorName("Uncle Bob");
        donation.setAmount(BigDecimal.valueOf(10000));
        donation.setPaymentMethod("Cash");
        donation.setUserId(TEST_USER_ID);
        donation.setDonationDate(LocalDate.now());
        return donation;
    }

    public static EventDonationDTO buildEventDonationDTO(Integer eventId) {
        EventDonationDTO dto = new EventDonationDTO();
        dto.setId(1);
        dto.setEventId(eventId);
        dto.setDonorName("Uncle Bob");
        dto.setAmount(BigDecimal.valueOf(10000));
        dto.setPaymentMethod("Cash");
        dto.setUserId(TEST_USER_ID);
        dto.setDonationDate(LocalDate.now());
        return dto;
    }

    public static EventBudget buildEventBudget(Event event) {
        EventBudget budget = new EventBudget();
        budget.setId(1);
        budget.setEvent(event);
        budget.setCategory("Venue");
        budget.setAllocatedAmount(BigDecimal.valueOf(30000));
        budget.setSpentAmount(BigDecimal.ZERO);
        budget.setRemainingAmount(BigDecimal.valueOf(30000));
        budget.setUserId(TEST_USER_ID);
        return budget;
    }

    public static EventBudgetDTO buildEventBudgetDTO(Integer eventId) {
        EventBudgetDTO dto = new EventBudgetDTO();
        dto.setId(1);
        dto.setEventId(eventId);
        dto.setCategory("Venue");
        dto.setAllocatedAmount(BigDecimal.valueOf(30000));
        dto.setSpentAmount(BigDecimal.ZERO);
        dto.setRemainingAmount(BigDecimal.valueOf(30000));
        dto.setUserId(TEST_USER_ID);
        return dto;
    }

    public static EventDTO buildEventDTO(String eventName, Event.EventType eventType, Event.EventStatus status, BigDecimal totalBudget) {
        EventDTO dto = buildEventDTO();
        dto.setEventName(eventName);
        dto.setEventType(eventType);
        dto.setStatus(status);
        dto.setTotalBudget(totalBudget);
        return dto;
    }

    public static EventExpenseDTO buildEventExpenseDTO(Integer eventId, BigDecimal amount, Integer userId) {
        EventExpenseDTO dto = buildEventExpenseDTO(eventId);
        dto.setAmount(amount);
        dto.setUserId(userId);
        return dto;
    }
}
