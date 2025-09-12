package com.jaya.service;

import com.jaya.dto.*;
import com.jaya.model.Event;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface EventService {

    // Event CRUD operations
    EventDTO createEvent(EventDTO eventDTO);
    EventDTO updateEvent(Integer eventId, EventDTO eventDTO, Integer userId);
    void deleteEvent(Integer eventId, Integer userId);
    EventDTO getEventById(Integer eventId, Integer userId);
    List<EventDTO> getAllEventsByUser(Integer userId);
    List<EventDTO> getEventsByStatus(Integer userId, Event.EventStatus status);
    List<EventDTO> getEventsByType(Integer userId, Event.EventType eventType);
    List<EventDTO> getEventsByDateRange(Integer userId, LocalDate startDate, LocalDate endDate);
    List<EventDTO> searchEventsByName(Integer userId, String eventName);

    // Event Expense operations
    EventExpenseDTO addExpenseToEvent(EventExpenseDTO expenseDTO);
    EventExpenseDTO updateEventExpense(Integer expenseId, EventExpenseDTO expenseDTO, Integer userId);
    void deleteEventExpense(Integer expenseId, Integer userId);
    List<EventExpenseDTO> getExpensesByEvent(Integer eventId, Integer userId);
    List<EventExpenseDTO> getExpensesByCategory(Integer eventId, String category);
    BigDecimal getTotalExpensesByEvent(Integer eventId);
    Map<String, BigDecimal> getCategoryWiseExpenses(Integer eventId);

    // Event Donation operations
    EventDonationDTO addDonationToEvent(EventDonationDTO donationDTO);
    EventDonationDTO updateEventDonation(Integer donationId, EventDonationDTO donationDTO, Integer userId);
    void deleteEventDonation(Integer donationId, Integer userId);
    List<EventDonationDTO> getDonationsByEvent(Integer eventId, Integer userId);
    BigDecimal getTotalDonationsByEvent(Integer eventId);
    Map<String, BigDecimal> getPaymentMethodWiseDonations(Integer eventId);

    // Event Budget operations
    EventBudgetDTO createEventBudget(EventBudgetDTO budgetDTO);
    EventBudgetDTO updateEventBudget(Integer budgetId, EventBudgetDTO budgetDTO, Integer userId);
    void deleteEventBudget(Integer budgetId, Integer userId);
    List<EventBudgetDTO> getBudgetsByEvent(Integer eventId, Integer userId);
    BigDecimal getTotalBudgetByEvent(Integer eventId);

    // Analytics and Reports
    Map<String, Object> getEventSummary(Integer eventId, Integer userId);
    Map<String, Object> getEventAnalytics(Integer eventId, Integer userId);
    List<Map<String, Object>> getMonthlyEventSummary(Integer userId, int year, int month);
    Map<String, Object> getEventFinancialOverview(Integer eventId, Integer userId);

    // Utility methods
    void updateEventTotals(Integer eventId);
    List<String> getEventCategories();
    List<String> getPaymentMethods();
    Map<String, Long> getEventStatusCounts(Integer userId);
}