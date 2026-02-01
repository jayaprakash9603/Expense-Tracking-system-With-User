package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Lightweight DTO for budget search results.
 * Avoids lazy loading issues by containing only essential fields.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BudgetSearchDTO {
    private Integer id;
    private String name;
    private String description;
    private Double amount;
    private Double remainingAmount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer userId;
}
