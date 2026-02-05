package com.jaya.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BudgetExpenseEvent {
    private Integer userId;
    private Integer expenseId;
    private Set<Integer> budgetIds;
    private String action;
}