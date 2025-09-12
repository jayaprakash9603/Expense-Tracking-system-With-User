package com.jaya.dto;

import com.jaya.model.Event;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventDTO {

    private Integer id;
    private String eventName;
    private String description;
    private Event.EventType eventType;
    private Event.EventStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer userId;
    private BigDecimal totalBudget;
    private BigDecimal totalExpenses;
    private BigDecimal totalDonations;
    private BigDecimal remainingBudget;
    private String location;
    private Integer expectedGuests;
    private String notes;
    private List<EventExpenseDTO> eventExpenses;
    private List<EventDonationDTO> eventDonations;
    private List<EventBudgetDTO> eventBudgets;
}