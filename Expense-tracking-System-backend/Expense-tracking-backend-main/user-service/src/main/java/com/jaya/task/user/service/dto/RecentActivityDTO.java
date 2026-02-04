package com.jaya.task.user.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for recent system activity
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentActivityDTO {
    private String type; // USER_REGISTRATION, EXPENSE_CREATED, BUDGET_CREATED, CATEGORY_ADDED
    private String icon; // Icon identifier for frontend
    private String title; // e.g., "User Registration", "Expenses Created"
    private String timeLabel; // e.g., "Last hour", "Last 24 hours"
    private long count; // Number of events
    private LocalDateTime timestamp;
}
