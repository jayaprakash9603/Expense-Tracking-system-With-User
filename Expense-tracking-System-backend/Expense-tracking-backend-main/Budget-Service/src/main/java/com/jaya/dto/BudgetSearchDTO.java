package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

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
    private double amount;
    private double remainingAmount;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer userId;
}
