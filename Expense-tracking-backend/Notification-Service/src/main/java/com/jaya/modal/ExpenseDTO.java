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
public class ExpenseDTO {

    private Integer id;
    private LocalDate date;
    private boolean includeInBudget = false;
    private Set<Integer> budgetIds = new HashSet<>();
    private Integer categoryId = 0;
    private String categoryName = "";
    private boolean isBill = false;
    private Integer userId;

    private ExpenseDetailsDTO expenseDetails;
}