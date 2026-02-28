package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BillResponseDTO {
    private Integer id;
    private String name;
    private String description;
    private double amount;
    private String paymentMethod;
    private String type;
    private double creditDue;
    private LocalDate date;
    private double netAmount;
    private Integer userId;
    private String category;
    private List<DetailedExpensesDTO> expenses;
    private boolean includeInBudget;
    private Set<Integer> budgetIds;
    private Integer categoryId;
    private Integer expenseId;
}
