package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BudgetAlertDTO {

    private Integer budgetId;
    private String budgetName;
    private double budgetAmount;
    private double currentSpending;
    private double remainingAmount;
    private double percentageUsed;
    private LocalDate startDate;
    private LocalDate endDate;
    private int daysRemaining;
    private String alertType;
    private String severity;
    private String recommendation;
}