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
    private boolean isRecurring = false;
    private Integer userId;

    private Set<Integer> budgetIds = new HashSet<>();

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public Integer getCategoryId() { return categoryId; }
    public void setCategoryId(Integer categoryId) { this.categoryId = categoryId; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public String getCategoryIcon() { return categoryIcon; }
    public void setCategoryIcon(String categoryIcon) { this.categoryIcon = categoryIcon; }
    public String getCategoryColor() { return categoryColor; }
    public void setCategoryColor(String categoryColor) { this.categoryColor = categoryColor; }
    public String getPaymentMethodIcon() { return paymentMethodIcon; }
    public void setPaymentMethodIcon(String paymentMethodIcon) { this.paymentMethodIcon = paymentMethodIcon; }
    public String getPaymentMethodColor() { return paymentMethodColor; }
    public void setPaymentMethodColor(String paymentMethodColor) { this.paymentMethodColor = paymentMethodColor; }
    public ExpenseDetailsDTO getExpense() { return expense; }
    public void setExpense(ExpenseDetailsDTO expense) { this.expense = expense; }
    public boolean isIncludeInBudget() { return includeInBudget; }
    public void setIncludeInBudget(boolean includeInBudget) { this.includeInBudget = includeInBudget; }
    public boolean isBill() { return isBill; }
    public void setBill(boolean isBill) { this.isBill = isBill; }
    public boolean isRecurring() { return isRecurring; }
    public void setRecurring(boolean isRecurring) { this.isRecurring = isRecurring; }
    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }
    public Set<Integer> getBudgetIds() { return budgetIds; }
    public void setBudgetIds(Set<Integer> budgetIds) { this.budgetIds = budgetIds; }

    @Override
    public String toString() {
        return "ExpenseDTO{" +
                "id=" + id +
                ", date='" + date + '\'' +
                ", expense=" + expense +
                '}';
    }
}
