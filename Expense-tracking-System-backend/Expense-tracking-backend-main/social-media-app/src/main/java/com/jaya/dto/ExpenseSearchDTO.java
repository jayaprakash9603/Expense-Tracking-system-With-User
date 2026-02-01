package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Lightweight DTO for expense search results.
 * Avoids lazy loading issues by containing only essential fields.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseSearchDTO {
    private Integer id;
    private LocalDate date;
    private String expenseName;
    private double amount;
    private String type;
    private String paymentMethod;
    private double netAmount;
    private String comments;
    private Integer categoryId;
    private String categoryName;
    private Integer userId;
    private boolean includeInBudget;
}
