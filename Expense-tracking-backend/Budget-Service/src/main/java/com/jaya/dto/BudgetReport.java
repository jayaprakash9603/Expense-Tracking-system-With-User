package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BudgetReport {

    private Integer budgetId;
    private String budgetName;
    private String description;
    private double allocatedAmount;
    private LocalDate startDate;
    private LocalDate endDate;
    private double remainingAmount;
    private boolean isValid;
    private double totalCashLosses;
    private double totalCreditLosses;
    private int expenseCount;
    private double dailyBudget;
    private double projectedOverspend;

}
