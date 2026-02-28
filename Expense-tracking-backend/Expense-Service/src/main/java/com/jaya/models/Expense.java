package com.jaya.models;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.ToString;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "expenses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @JsonSerialize(using = LocalDateSerializer.class)
    private LocalDate date;

    @Column(nullable = false)
    private boolean includeInBudget = false;

    @Column(name = "budget_ids", columnDefinition = "LONGBLOB")
    private Set<Integer> budgetIds = new HashSet<>();

    private Integer categoryId = 0;

    private String categoryName = "";

    
    @OneToOne(mappedBy = "expense", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    @ToString.Exclude
    private ExpenseDetails expense;

    private boolean isBill = false;

    @Column(name = "is_recurring", nullable = false)
    private boolean isRecurring = false;

    @Column(name = "expense_user_id")
    private Integer userId;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public Integer getCategoryId() { return categoryId; }
    public void setCategoryId(Integer categoryId) { this.categoryId = categoryId; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
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
    public ExpenseDetails getExpense() { return expense; }
    public void setExpense(ExpenseDetails expense) { this.expense = expense; }
}
