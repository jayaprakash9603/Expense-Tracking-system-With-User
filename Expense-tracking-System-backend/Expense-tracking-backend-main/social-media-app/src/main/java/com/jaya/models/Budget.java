package com.jaya.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    private String name;
    private String description;
    private double amount;
    private LocalDate startDate;
    private LocalDate endDate;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    @Column(name = "expense_ids", columnDefinition = "LONGBLOB")
    private Set<Integer> expenseIds = new HashSet<>();

    private double remainingAmount;
    private boolean isBudgetHasExpenses;

    @Column(nullable = false)
    private boolean includeInBudget = false;

    public void deductAmount(double expenseAmount) {
        this.amount -= expenseAmount;
    }
}