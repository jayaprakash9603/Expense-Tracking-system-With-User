package com.jaya.controller;

import com.jaya.dto.*;
import com.jaya.model.Event;
import com.jaya.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @PostMapping
    public ResponseEntity<EventDTO> createEvent(@RequestBody EventDTO eventDTO) {
        EventDTO createdEvent = eventService.createEvent(eventDTO);
        return new ResponseEntity<>(createdEvent, HttpStatus.CREATED);
    }

    @PutMapping("/{eventId}/user/{userId}")
    public ResponseEntity<EventDTO> updateEvent(
            @PathVariable Integer eventId,
            @PathVariable Integer userId,
            @RequestBody EventDTO eventDTO) {
        EventDTO updatedEvent = eventService.updateEvent(eventId, eventDTO, userId);
        return ResponseEntity.ok(updatedEvent);
    }

    @DeleteMapping("/{eventId}/user/{userId}")
    public ResponseEntity<Void> deleteEvent(
            @PathVariable Integer eventId,
            @PathVariable Integer userId) {
        eventService.deleteEvent(eventId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{eventId}/user/{userId}")
    public ResponseEntity<EventDTO> getEventById(
            @PathVariable Integer eventId,
            @PathVariable Integer userId) {
        EventDTO event = eventService.getEventById(eventId, userId);
        return ResponseEntity.ok(event);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<EventDTO>> getAllEventsByUser(@PathVariable Integer userId) {
        List<EventDTO> events = eventService.getAllEventsByUser(userId);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/user/{userId}/status/{status}")
    public ResponseEntity<List<EventDTO>> getEventsByStatus(
            @PathVariable Integer userId,
            @PathVariable Event.EventStatus status) {
        List<EventDTO> events = eventService.getEventsByStatus(userId, status);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/user/{userId}/type/{eventType}")
    public ResponseEntity<List<EventDTO>> getEventsByType(
            @PathVariable Integer userId,
            @PathVariable Event.EventType eventType) {
        List<EventDTO> events = eventService.getEventsByType(userId, eventType);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/user/{userId}/date-range")
    public ResponseEntity<List<EventDTO>> getEventsByDateRange(
            @PathVariable Integer userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<EventDTO> events = eventService.getEventsByDateRange(userId, startDate, endDate);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/user/{userId}/search")
    public ResponseEntity<List<EventDTO>> searchEventsByName(
            @PathVariable Integer userId,
            @RequestParam String eventName) {
        List<EventDTO> events = eventService.searchEventsByName(userId, eventName);
        return ResponseEntity.ok(events);
    }

    @PostMapping("/expenses")
    public ResponseEntity<EventExpenseDTO> addExpenseToEvent(@RequestBody EventExpenseDTO expenseDTO) {
        EventExpenseDTO createdExpense = eventService.addExpenseToEvent(expenseDTO);
        return new ResponseEntity<>(createdExpense, HttpStatus.CREATED);
    }

    @PutMapping("/expenses/{expenseId}/user/{userId}")
    public ResponseEntity<EventExpenseDTO> updateEventExpense(
            @PathVariable Integer expenseId,
            @PathVariable Integer userId,
            @RequestBody EventExpenseDTO expenseDTO) {
        EventExpenseDTO updatedExpense = eventService.updateEventExpense(expenseId, expenseDTO, userId);
        return ResponseEntity.ok(updatedExpense);
    }

    @DeleteMapping("/expenses/{expenseId}/user/{userId}")
    public ResponseEntity<Void> deleteEventExpense(
            @PathVariable Integer expenseId,
            @PathVariable Integer userId) {
        eventService.deleteEventExpense(expenseId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{eventId}/expenses/user/{userId}")
    public ResponseEntity<List<EventExpenseDTO>> getExpensesByEvent(
            @PathVariable Integer eventId,
            @PathVariable Integer userId) {
        List<EventExpenseDTO> expenses = eventService.getExpensesByEvent(eventId, userId);
        return ResponseEntity.ok(expenses);
    }

    @GetMapping("/{eventId}/expenses/category/{category}")
    public ResponseEntity<List<EventExpenseDTO>> getExpensesByCategory(
            @PathVariable Integer eventId,
            @PathVariable String category) {
        List<EventExpenseDTO> expenses = eventService.getExpensesByCategory(eventId, category);
        return ResponseEntity.ok(expenses);
    }

    @GetMapping("/{eventId}/expenses/total")
    public ResponseEntity<BigDecimal> getTotalExpensesByEvent(@PathVariable Integer eventId) {
        BigDecimal total = eventService.getTotalExpensesByEvent(eventId);
        return ResponseEntity.ok(total);
    }

    @GetMapping("/{eventId}/expenses/category-wise")
    public ResponseEntity<Map<String, BigDecimal>> getCategoryWiseExpenses(@PathVariable Integer eventId) {
        Map<String, BigDecimal> categoryExpenses = eventService.getCategoryWiseExpenses(eventId);
        return ResponseEntity.ok(categoryExpenses);
    }

    @PostMapping("/donations")
    public ResponseEntity<EventDonationDTO> addDonationToEvent(@RequestBody EventDonationDTO donationDTO) {
        EventDonationDTO createdDonation = eventService.addDonationToEvent(donationDTO);
        return new ResponseEntity<>(createdDonation, HttpStatus.CREATED);
    }

    @PutMapping("/donations/{donationId}/user/{userId}")
    public ResponseEntity<EventDonationDTO> updateEventDonation(
            @PathVariable Integer donationId,
            @PathVariable Integer userId,
            @RequestBody EventDonationDTO donationDTO) {
        EventDonationDTO updatedDonation = eventService.updateEventDonation(donationId, donationDTO, userId);
        return ResponseEntity.ok(updatedDonation);
    }

    @DeleteMapping("/donations/{donationId}/user/{userId}")
    public ResponseEntity<Void> deleteEventDonation(
            @PathVariable Integer donationId,
            @PathVariable Integer userId) {
        eventService.deleteEventDonation(donationId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{eventId}/donations/user/{userId}")
    public ResponseEntity<List<EventDonationDTO>> getDonationsByEvent(
            @PathVariable Integer eventId,
            @PathVariable Integer userId) {
        List<EventDonationDTO> donations = eventService.getDonationsByEvent(eventId, userId);
        return ResponseEntity.ok(donations);
    }

    @GetMapping("/{eventId}/donations/total")
    public ResponseEntity<BigDecimal> getTotalDonationsByEvent(@PathVariable Integer eventId) {
        BigDecimal total = eventService.getTotalDonationsByEvent(eventId);
        return ResponseEntity.ok(total);
    }

    @GetMapping("/{eventId}/donations/payment-method-wise")
    public ResponseEntity<Map<String, BigDecimal>> getPaymentMethodWiseDonations(@PathVariable Integer eventId) {
        Map<String, BigDecimal> paymentMethodDonations = eventService.getPaymentMethodWiseDonations(eventId);
        return ResponseEntity.ok(paymentMethodDonations);
    }

    @PostMapping("/budgets")
    public ResponseEntity<EventBudgetDTO> createEventBudget(@RequestBody EventBudgetDTO budgetDTO) {
        EventBudgetDTO createdBudget = eventService.createEventBudget(budgetDTO);
        return new ResponseEntity<>(createdBudget, HttpStatus.CREATED);
    }

    @PutMapping("/budgets/{budgetId}/user/{userId}")
    public ResponseEntity<EventBudgetDTO> updateEventBudget(
            @PathVariable Integer budgetId,
            @PathVariable Integer userId,
            @RequestBody EventBudgetDTO budgetDTO) {
        EventBudgetDTO updatedBudget = eventService.updateEventBudget(budgetId, budgetDTO, userId);
        return ResponseEntity.ok(updatedBudget);
    }

    @DeleteMapping("/budgets/{budgetId}/user/{userId}")
    public ResponseEntity<Void> deleteEventBudget(
            @PathVariable Integer budgetId,
            @PathVariable Integer userId) {
        eventService.deleteEventBudget(budgetId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{eventId}/budgets/user/{userId}")
    public ResponseEntity<List<EventBudgetDTO>> getBudgetsByEvent(
            @PathVariable Integer eventId,
            @PathVariable Integer userId) {
        List<EventBudgetDTO> budgets = eventService.getBudgetsByEvent(eventId, userId);
        return ResponseEntity.ok(budgets);
    }

    @GetMapping("/{eventId}/budgets/total")
    public ResponseEntity<BigDecimal> getTotalBudgetByEvent(@PathVariable Integer eventId) {
        BigDecimal total = eventService.getTotalBudgetByEvent(eventId);
        return ResponseEntity.ok(total);
    }

    @GetMapping("/{eventId}/summary/user/{userId}")
    public ResponseEntity<Map<String, Object>> getEventSummary(
            @PathVariable Integer eventId,
            @PathVariable Integer userId) {
        Map<String, Object> summary = eventService.getEventSummary(eventId, userId);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/{eventId}/analytics/user/{userId}")
    public ResponseEntity<Map<String, Object>> getEventAnalytics(
            @PathVariable Integer eventId,
            @PathVariable Integer userId) {
        Map<String, Object> analytics = eventService.getEventAnalytics(eventId, userId);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/user/{userId}/monthly-summary/{year}/{month}")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyEventSummary(
            @PathVariable Integer userId,
            @PathVariable int year,
            @PathVariable int month) {
        List<Map<String, Object>> summary = eventService.getMonthlyEventSummary(userId, year, month);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/{eventId}/financial-overview/user/{userId}")
    public ResponseEntity<Map<String, Object>> getEventFinancialOverview(
            @PathVariable Integer eventId,
            @PathVariable Integer userId) {
        Map<String, Object> overview = eventService.getEventFinancialOverview(eventId, userId);
        return ResponseEntity.ok(overview);
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getEventCategories() {
        List<String> categories = eventService.getEventCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/payment-methods")
    public ResponseEntity<List<String>> getPaymentMethods() {
        List<String> paymentMethods = eventService.getPaymentMethods();
        return ResponseEntity.ok(paymentMethods);
    }

    @GetMapping("/user/{userId}/status-counts")
    public ResponseEntity<Map<String, Long>> getEventStatusCounts(@PathVariable Integer userId) {
        Map<String, Long> statusCounts = eventService.getEventStatusCounts(userId);
        return ResponseEntity.ok(statusCounts);
    }

    @PostMapping("/{eventId}/update-totals")
    public ResponseEntity<Void> updateEventTotals(@PathVariable Integer eventId) {
        eventService.updateEventTotals(eventId);
        return ResponseEntity.ok().build();
    }
}