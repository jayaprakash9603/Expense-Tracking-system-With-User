package com.jaya.service.impl;

import com.jaya.dto.*;
import com.jaya.model.*;
import com.jaya.repository.*;
import com.jaya.service.EventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final EventExpenseRepository eventExpenseRepository;
    private final EventDonationRepository eventDonationRepository;
    private final EventBudgetRepository eventBudgetRepository;

    @Override
    public EventDTO createEvent(EventDTO eventDTO) {
        Event event = convertToEntity(eventDTO);
        event.setRemainingBudget(event.getTotalBudget());
        Event savedEvent = eventRepository.save(event);
        log.info("Created new event: {} for user: {}", savedEvent.getEventName(), savedEvent.getUserId());
        return convertToDTO(savedEvent);
    }

    @Override
    public EventDTO updateEvent(Integer eventId, EventDTO eventDTO, Integer userId) {
        Event existingEvent = eventRepository.findByIdAndUserId(eventId, userId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        updateEventFields(existingEvent, eventDTO);
        Event updatedEvent = eventRepository.save(existingEvent);
        updateEventTotals(eventId);

        log.info("Updated event: {} for user: {}", updatedEvent.getEventName(), userId);
        return convertToDTO(updatedEvent);
    }

    @Override
    public void deleteEvent(Integer eventId, Integer userId) {
        Event event = eventRepository.findByIdAndUserId(eventId, userId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        eventRepository.delete(event);
        log.info("Deleted event: {} for user: {}", event.getEventName(), userId);
    }

    @Override
    public EventDTO getEventById(Integer eventId, Integer userId) {
        Event event = eventRepository.findByIdAndUserId(eventId, userId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        return convertToDTO(event);
    }

    @Override
    public List<EventDTO> getAllEventsByUser(Integer userId) {
        List<Event> events = eventRepository.findByUserIdOrderByStartDateDesc(userId);
        return events.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<EventDTO> getEventsByStatus(Integer userId, Event.EventStatus status) {
        List<Event> events = eventRepository.findByUserIdAndStatus(userId, status);
        return events.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<EventDTO> getEventsByType(Integer userId, Event.EventType eventType) {
        List<Event> events = eventRepository.findByUserIdAndEventType(userId, eventType);
        return events.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<EventDTO> getEventsByDateRange(Integer userId, LocalDate startDate, LocalDate endDate) {
        List<Event> events = eventRepository.findByUserIdAndStartDateBetween(userId, startDate, endDate);
        return events.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<EventDTO> searchEventsByName(Integer userId, String eventName) {
        List<Event> events = eventRepository.findByUserIdAndEventNameContaining(userId, eventName);
        return events.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public EventExpenseDTO addExpenseToEvent(EventExpenseDTO expenseDTO) {
        Event event = eventRepository.findById(expenseDTO.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));

        EventExpense expense = convertToExpenseEntity(expenseDTO);
        expense.setEvent(event);
        EventExpense savedExpense = eventExpenseRepository.save(expense);

        updateEventTotals(expenseDTO.getEventId());
        log.info("Added expense: {} to event: {}", savedExpense.getExpenseName(), event.getEventName());

        return convertToExpenseDTO(savedExpense);
    }

    @Override
    public EventExpenseDTO updateEventExpense(Integer expenseId, EventExpenseDTO expenseDTO, Integer userId) {
        EventExpense existingExpense = eventExpenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Event expense not found"));

        if (!existingExpense.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to expense");
        }

        updateExpenseFields(existingExpense, expenseDTO);
        EventExpense updatedExpense = eventExpenseRepository.save(existingExpense);
        updateEventTotals(existingExpense.getEvent().getId());

        return convertToExpenseDTO(updatedExpense);
    }

    @Override
    public void deleteEventExpense(Integer expenseId, Integer userId) {
        EventExpense expense = eventExpenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Event expense not found"));

        if (!expense.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to expense");
        }

        Integer eventId = expense.getEvent().getId();
        eventExpenseRepository.delete(expense);
        updateEventTotals(eventId);

        log.info("Deleted expense: {} for user: {}", expense.getExpenseName(), userId);
    }

    @Override
    public List<EventExpenseDTO> getExpensesByEvent(Integer eventId, Integer userId) {
        List<EventExpense> expenses = eventExpenseRepository.findByEventIdAndUserId(eventId, userId);
        return expenses.stream().map(this::convertToExpenseDTO).collect(Collectors.toList());
    }

    @Override
    public List<EventExpenseDTO> getExpensesByCategory(Integer eventId, String category) {
        List<EventExpense> expenses = eventExpenseRepository.findByEventIdAndCategory(eventId, category);
        return expenses.stream().map(this::convertToExpenseDTO).collect(Collectors.toList());
    }

    @Override
    public BigDecimal getTotalExpensesByEvent(Integer eventId) {
        BigDecimal total = eventExpenseRepository.getTotalExpensesByEventId(eventId);
        return total != null ? total : BigDecimal.ZERO;
    }

    @Override
    public Map<String, BigDecimal> getCategoryWiseExpenses(Integer eventId) {
        List<Object[]> results = eventExpenseRepository.getCategoryWiseExpenses(eventId);
        Map<String, BigDecimal> categoryExpenses = new HashMap<>();

        for (Object[] result : results) {
            String category = (String) result[0];
            BigDecimal amount = (BigDecimal) result[1];
            categoryExpenses.put(category, amount);
        }

        return categoryExpenses;
    }

    @Override
    public EventDonationDTO addDonationToEvent(EventDonationDTO donationDTO) {
        Event event = eventRepository.findById(donationDTO.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));

        EventDonation donation = convertToDonationEntity(donationDTO);
        donation.setEvent(event);
        EventDonation savedDonation = eventDonationRepository.save(donation);

        updateEventTotals(donationDTO.getEventId());
        log.info("Added donation from: {} to event: {}", savedDonation.getDonorName(), event.getEventName());

        return convertToDonationDTO(savedDonation);
    }

    @Override
    public EventDonationDTO updateEventDonation(Integer donationId, EventDonationDTO donationDTO, Integer userId) {
        EventDonation existingDonation = eventDonationRepository.findById(donationId)
                .orElseThrow(() -> new RuntimeException("Event donation not found"));

        if (!existingDonation.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to donation");
        }

        updateDonationFields(existingDonation, donationDTO);
        EventDonation updatedDonation = eventDonationRepository.save(existingDonation);
        updateEventTotals(existingDonation.getEvent().getId());

        return convertToDonationDTO(updatedDonation);
    }

    @Override
    public void deleteEventDonation(Integer donationId, Integer userId) {
        EventDonation donation = eventDonationRepository.findById(donationId)
                .orElseThrow(() -> new RuntimeException("Event donation not found"));

        if (!donation.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to donation");
        }

        Integer eventId = donation.getEvent().getId();
        eventDonationRepository.delete(donation);
        updateEventTotals(eventId);

        log.info("Deleted donation from: {} for user: {}", donation.getDonorName(), userId);
    }

    @Override
    public List<EventDonationDTO> getDonationsByEvent(Integer eventId, Integer userId) {
        List<EventDonation> donations = eventDonationRepository.findByEventIdAndUserId(eventId, userId);
        return donations.stream().map(this::convertToDonationDTO).collect(Collectors.toList());
    }

    @Override
    public BigDecimal getTotalDonationsByEvent(Integer eventId) {
        BigDecimal total = eventDonationRepository.getTotalDonationsByEventId(eventId);
        return total != null ? total : BigDecimal.ZERO;
    }

    @Override
    public Map<String, BigDecimal> getPaymentMethodWiseDonations(Integer eventId) {
        List<Object[]> results = eventDonationRepository.getPaymentMethodWiseDonations(eventId);
        Map<String, BigDecimal> paymentMethodDonations = new HashMap<>();

        for (Object[] result : results) {
            String paymentMethod = (String) result[0];
            BigDecimal amount = (BigDecimal) result[1];
            paymentMethodDonations.put(paymentMethod, amount);
        }

        return paymentMethodDonations;
    }

    @Override
    public EventBudgetDTO createEventBudget(EventBudgetDTO budgetDTO) {
        Event event = eventRepository.findById(budgetDTO.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));

        EventBudget budget = convertToBudgetEntity(budgetDTO);
        budget.setEvent(event);
        budget.setRemainingAmount(budget.getAllocatedAmount());
        EventBudget savedBudget = eventBudgetRepository.save(budget);

        updateEventTotals(budgetDTO.getEventId());
        log.info("Created budget for category: {} in event: {}", savedBudget.getCategory(), event.getEventName());

        return convertToBudgetDTO(savedBudget);
    }

    @Override
    public EventBudgetDTO updateEventBudget(Integer budgetId, EventBudgetDTO budgetDTO, Integer userId) {
        EventBudget existingBudget = eventBudgetRepository.findById(budgetId)
                .orElseThrow(() -> new RuntimeException("Event budget not found"));

        if (!existingBudget.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to budget");
        }

        updateBudgetFields(existingBudget, budgetDTO);
        EventBudget updatedBudget = eventBudgetRepository.save(existingBudget);
        updateEventTotals(existingBudget.getEvent().getId());

        return convertToBudgetDTO(updatedBudget);
    }

    @Override
    public void deleteEventBudget(Integer budgetId, Integer userId) {
        EventBudget budget = eventBudgetRepository.findById(budgetId)
                .orElseThrow(() -> new RuntimeException("Event budget not found"));

        if (!budget.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to budget");
        }

        Integer eventId = budget.getEvent().getId();
        eventBudgetRepository.delete(budget);
        updateEventTotals(eventId);

        log.info("Deleted budget for category: {} for user: {}", budget.getCategory(), userId);
    }

    @Override
    public List<EventBudgetDTO> getBudgetsByEvent(Integer eventId, Integer userId) {
        List<EventBudget> budgets = eventBudgetRepository.findByEventIdAndUserId(eventId, userId);
        return budgets.stream().map(this::convertToBudgetDTO).collect(Collectors.toList());
    }

    @Override
    public BigDecimal getTotalBudgetByEvent(Integer eventId) {
        BigDecimal total = eventBudgetRepository.getTotalBudgetByEventId(eventId);
        return total != null ? total : BigDecimal.ZERO;
    }

    @Override
    public Map<String, Object> getEventSummary(Integer eventId, Integer userId) {
        Event event = eventRepository.findByIdAndUserId(eventId, userId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        Map<String, Object> summary = new HashMap<>();
        summary.put("event", convertToDTO(event));
        summary.put("totalBudget", event.getTotalBudget());
        summary.put("totalExpenses", event.getTotalExpenses());
        summary.put("totalDonations", event.getTotalDonations());
        summary.put("remainingBudget", event.getRemainingBudget());
        summary.put("categoryWiseExpenses", getCategoryWiseExpenses(eventId));
        summary.put("paymentMethodWiseDonations", getPaymentMethodWiseDonations(eventId));

        return summary;
    }

    @Override
    public Map<String, Object> getEventAnalytics(Integer eventId, Integer userId) {
        Map<String, Object> analytics = new HashMap<>();

        BigDecimal totalBudget = getTotalBudgetByEvent(eventId);
        BigDecimal totalExpenses = getTotalExpensesByEvent(eventId);
        BigDecimal totalDonations = getTotalDonationsByEvent(eventId);

        analytics.put("budgetUtilization",
                totalBudget.compareTo(BigDecimal.ZERO) > 0 ? totalExpenses
                        .divide(totalBudget, 4, BigDecimal.ROUND_HALF_UP).multiply(BigDecimal.valueOf(100))
                        : BigDecimal.ZERO);
        analytics.put("donationCoverage",
                totalExpenses.compareTo(BigDecimal.ZERO) > 0 ? totalDonations
                        .divide(totalExpenses, 4, BigDecimal.ROUND_HALF_UP).multiply(BigDecimal.valueOf(100))
                        : BigDecimal.ZERO);
        analytics.put("categoryWiseExpenses", getCategoryWiseExpenses(eventId));
        analytics.put("paymentMethodWiseDonations", getPaymentMethodWiseDonations(eventId));

        return analytics;
    }

    @Override
    public List<Map<String, Object>> getMonthlyEventSummary(Integer userId, int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        List<Event> events = eventRepository.findByUserIdAndStartDateBetween(userId, startDate, endDate);

        return events.stream().map(event -> {
            Map<String, Object> eventSummary = new HashMap<>();
            eventSummary.put("eventId", event.getId());
            eventSummary.put("eventName", event.getEventName());
            eventSummary.put("eventType", event.getEventType());
            eventSummary.put("status", event.getStatus());
            eventSummary.put("totalBudget", event.getTotalBudget());
            eventSummary.put("totalExpenses", event.getTotalExpenses());
            eventSummary.put("totalDonations", event.getTotalDonations());
            return eventSummary;
        }).collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getEventFinancialOverview(Integer eventId, Integer userId) {
        Event event = eventRepository.findByIdAndUserId(eventId, userId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        Map<String, Object> overview = new HashMap<>();
        overview.put("eventName", event.getEventName());
        overview.put("totalBudget", event.getTotalBudget());
        overview.put("totalExpenses", event.getTotalExpenses());
        overview.put("totalDonations", event.getTotalDonations());
        overview.put("remainingBudget", event.getRemainingBudget());
        overview.put("budgetVsExpenses", event.getTotalBudget().subtract(event.getTotalExpenses()));
        overview.put("donationsVsExpenses", event.getTotalDonations().subtract(event.getTotalExpenses()));

        return overview;
    }

    @Override
    public void updateEventTotals(Integer eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        BigDecimal totalExpenses = getTotalExpensesByEvent(eventId);
        BigDecimal totalDonations = getTotalDonationsByEvent(eventId);
        BigDecimal totalBudget = getTotalBudgetByEvent(eventId);

        event.setTotalExpenses(totalExpenses);
        event.setTotalDonations(totalDonations);
        if (totalBudget.compareTo(BigDecimal.ZERO) > 0) {
            event.setTotalBudget(totalBudget);
        }
        event.setRemainingBudget(event.getTotalBudget().subtract(totalExpenses));

        eventRepository.save(event);

        updateBudgetSpentAmounts(eventId);
    }

    @Override
    public List<String> getEventCategories() {
        return Arrays.asList(
                "Venue", "Catering", "Decoration", "Entertainment", "Photography",
                "Transportation", "Gifts", "Flowers", "Music", "Security",
                "Lighting", "Sound System", "Invitations", "Miscellaneous");
    }

    @Override
    public List<String> getPaymentMethods() {
        return Arrays.asList(
                "Cash", "Credit Card", "Debit Card", "UPI", "Net Banking",
                "Cheque", "Digital Wallet", "Bank Transfer");
    }

    @Override
    public Map<String, Long> getEventStatusCounts(Integer userId) {
        Map<String, Long> statusCounts = new HashMap<>();

        for (Event.EventStatus status : Event.EventStatus.values()) {
            Long count = eventRepository.countByUserIdAndStatus(userId, status);
            statusCounts.put(status.name(), count);
        }

        return statusCounts;
    }

    private void updateBudgetSpentAmounts(Integer eventId) {
        List<EventBudget> budgets = eventBudgetRepository.findByEventIdAndUserId(eventId, null);

        for (EventBudget budget : budgets) {
            BigDecimal spentAmount = eventExpenseRepository.getTotalExpensesByEventIdAndCategory(
                    eventId, budget.getCategory());

            if (spentAmount == null) {
                spentAmount = BigDecimal.ZERO;
            }

            budget.setSpentAmount(spentAmount);
            budget.setRemainingAmount(budget.getAllocatedAmount().subtract(spentAmount));
            eventBudgetRepository.save(budget);
        }
    }

    private Event convertToEntity(EventDTO dto) {
        Event event = new Event();
        event.setId(dto.getId());
        event.setEventName(dto.getEventName());
        event.setDescription(dto.getDescription());
        event.setEventType(dto.getEventType());
        event.setStatus(dto.getStatus());
        event.setStartDate(dto.getStartDate());
        event.setEndDate(dto.getEndDate());
        event.setUserId(dto.getUserId());
        event.setTotalBudget(dto.getTotalBudget() != null ? dto.getTotalBudget() : BigDecimal.ZERO);
        event.setLocation(dto.getLocation());
        event.setExpectedGuests(dto.getExpectedGuests());
        event.setNotes(dto.getNotes());
        return event;
    }

    private EventDTO convertToDTO(Event entity) {
        EventDTO dto = new EventDTO();
        dto.setId(entity.getId());
        dto.setEventName(entity.getEventName());
        dto.setDescription(entity.getDescription());
        dto.setEventType(entity.getEventType());
        dto.setStatus(entity.getStatus());
        dto.setStartDate(entity.getStartDate());
        dto.setEndDate(entity.getEndDate());
        dto.setUserId(entity.getUserId());
        dto.setTotalBudget(entity.getTotalBudget());
        dto.setTotalExpenses(entity.getTotalExpenses());
        dto.setTotalDonations(entity.getTotalDonations());
        dto.setRemainingBudget(entity.getRemainingBudget());
        dto.setLocation(entity.getLocation());
        dto.setExpectedGuests(entity.getExpectedGuests());
        dto.setNotes(entity.getNotes());
        return dto;
    }

    private EventExpense convertToExpenseEntity(EventExpenseDTO dto) {
        EventExpense expense = new EventExpense();
        expense.setId(dto.getId());
        expense.setExpenseName(dto.getExpenseName());
        expense.setDescription(dto.getDescription());
        expense.setAmount(dto.getAmount());
        expense.setExpenseDate(dto.getExpenseDate());
        expense.setCategory(dto.getCategory());
        expense.setPaymentMethod(dto.getPaymentMethod());
        expense.setVendor(dto.getVendor());
        expense.setReceiptNumber(dto.getReceiptNumber());
        expense.setNotes(dto.getNotes());
        expense.setUserId(dto.getUserId());
        return expense;
    }

    private EventExpenseDTO convertToExpenseDTO(EventExpense entity) {
        EventExpenseDTO dto = new EventExpenseDTO();
        dto.setId(entity.getId());
        dto.setEventId(entity.getEvent().getId());
        dto.setExpenseName(entity.getExpenseName());
        dto.setDescription(entity.getDescription());
        dto.setAmount(entity.getAmount());
        dto.setExpenseDate(entity.getExpenseDate());
        dto.setCategory(entity.getCategory());
        dto.setPaymentMethod(entity.getPaymentMethod());
        dto.setVendor(entity.getVendor());
        dto.setReceiptNumber(entity.getReceiptNumber());
        dto.setNotes(entity.getNotes());
        dto.setUserId(entity.getUserId());
        return dto;
    }

    private EventDonation convertToDonationEntity(EventDonationDTO dto) {
        EventDonation donation = new EventDonation();
        donation.setId(dto.getId());
        donation.setDonorName(dto.getDonorName());
        donation.setDonorContact(dto.getDonorContact());
        donation.setAmount(dto.getAmount());
        donation.setDonationDate(dto.getDonationDate());
        donation.setPaymentMethod(dto.getPaymentMethod());
        donation.setTransactionId(dto.getTransactionId());
        donation.setNotes(dto.getNotes());
        donation.setUserId(dto.getUserId());
        return donation;
    }

    private EventDonationDTO convertToDonationDTO(EventDonation entity) {
        EventDonationDTO dto = new EventDonationDTO();
        dto.setId(entity.getId());
        dto.setEventId(entity.getEvent().getId());
        dto.setDonorName(entity.getDonorName());
        dto.setDonorContact(entity.getDonorContact());
        dto.setAmount(entity.getAmount());
        dto.setDonationDate(entity.getDonationDate());
        dto.setPaymentMethod(entity.getPaymentMethod());
        dto.setTransactionId(entity.getTransactionId());
        dto.setNotes(entity.getNotes());
        dto.setUserId(entity.getUserId());
        return dto;
    }

    private EventBudget convertToBudgetEntity(EventBudgetDTO dto) {
        EventBudget budget = new EventBudget();
        budget.setId(dto.getId());
        budget.setCategory(dto.getCategory());
        budget.setAllocatedAmount(dto.getAllocatedAmount());
        budget.setSpentAmount(dto.getSpentAmount() != null ? dto.getSpentAmount() : BigDecimal.ZERO);
        budget.setDescription(dto.getDescription());
        budget.setUserId(dto.getUserId());
        return budget;
    }

    private EventBudgetDTO convertToBudgetDTO(EventBudget entity) {
        EventBudgetDTO dto = new EventBudgetDTO();
        dto.setId(entity.getId());
        dto.setEventId(entity.getEvent().getId());
        dto.setCategory(entity.getCategory());
        dto.setAllocatedAmount(entity.getAllocatedAmount());
        dto.setSpentAmount(entity.getSpentAmount());
        dto.setRemainingAmount(entity.getRemainingAmount());
        dto.setDescription(entity.getDescription());
        dto.setUserId(entity.getUserId());
        return dto;
    }

    private void updateEventFields(Event event, EventDTO dto) {
        event.setEventName(dto.getEventName());
        event.setDescription(dto.getDescription());
        event.setEventType(dto.getEventType());
        event.setStatus(dto.getStatus());
        event.setStartDate(dto.getStartDate());
        event.setEndDate(dto.getEndDate());
        event.setLocation(dto.getLocation());
        event.setExpectedGuests(dto.getExpectedGuests());
        event.setNotes(dto.getNotes());
        if (dto.getTotalBudget() != null) {
            event.setTotalBudget(dto.getTotalBudget());
        }
    }

    private void updateExpenseFields(EventExpense expense, EventExpenseDTO dto) {
        expense.setExpenseName(dto.getExpenseName());
        expense.setDescription(dto.getDescription());
        expense.setAmount(dto.getAmount());
        expense.setExpenseDate(dto.getExpenseDate());
        expense.setCategory(dto.getCategory());
        expense.setPaymentMethod(dto.getPaymentMethod());
        expense.setVendor(dto.getVendor());
        expense.setReceiptNumber(dto.getReceiptNumber());
        expense.setNotes(dto.getNotes());
    }

    private void updateDonationFields(EventDonation donation, EventDonationDTO dto) {
        donation.setDonorName(dto.getDonorName());
        donation.setDonorContact(dto.getDonorContact());
        donation.setAmount(dto.getAmount());
        donation.setDonationDate(dto.getDonationDate());
        donation.setPaymentMethod(dto.getPaymentMethod());
        donation.setTransactionId(dto.getTransactionId());
        donation.setNotes(dto.getNotes());
    }

    private void updateBudgetFields(EventBudget budget, EventBudgetDTO dto) {
        budget.setCategory(dto.getCategory());
        budget.setAllocatedAmount(dto.getAllocatedAmount());
        budget.setDescription(dto.getDescription());
        budget.setRemainingAmount(budget.getAllocatedAmount().subtract(budget.getSpentAmount()));
    }
}