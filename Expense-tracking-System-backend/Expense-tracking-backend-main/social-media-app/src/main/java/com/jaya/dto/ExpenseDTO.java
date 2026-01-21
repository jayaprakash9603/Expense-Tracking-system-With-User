package com.jaya.dto;

import jakarta.persistence.Column;
import lombok.Data;

import java.util.HashSet;
import java.util.Set;

@Data
public class ExpenseDTO {
    private Integer id;
    private String date;
    private Integer categoryId;
    private String categoryName;
    private String categoryIcon;
    private String categoryColor;
    private String paymentMethodIcon;
    private String paymentMethodColor;
    private ExpenseDetailsDTO expense;
    private boolean includeInBudget = false;
    private boolean isBill = false;
    private Integer userId;

    private Set<Integer> budgetIds = new HashSet<>();

    @Override
    public String toString() {
        return "ExpenseDTO{" +
                "id=" + id +
                ", date='" + date + '\'' +
                ", expense=" + expense +
                '}';
    }
}