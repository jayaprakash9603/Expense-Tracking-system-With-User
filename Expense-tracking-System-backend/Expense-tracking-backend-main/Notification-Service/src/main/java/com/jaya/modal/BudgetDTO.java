package com.jaya.modal;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BudgetDTO {

    private Integer id;
    private String name;
    private String description;
    private double amount;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer userId;
    private Set<Integer> expenseIds = new HashSet<>();
    private double remainingAmount;
    private boolean isBudgetHasExpenses;
    private boolean includeInBudget = false;
    private double spentAmount;
    private double percentageUsed;
    private int daysRemaining;
    private String status;
}