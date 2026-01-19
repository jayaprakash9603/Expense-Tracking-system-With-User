package com.jaya.models;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
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
    @JsonFormat(pattern = "yyyy-MM-dd")
    @JsonSerialize(using = LocalDateSerializer.class)
    private LocalDate startDate;
    @JsonFormat(pattern = "yyyy-MM-dd")
    @JsonSerialize(using = LocalDateSerializer.class)
    private LocalDate endDate;

    @Column(name = "budget_user_id")
    private Integer userId = 0;

    @Column(name = "expense_ids", columnDefinition = "LONGBLOB")
    private Set<Integer> expenseIds = new HashSet<>();

    private double remainingAmount;
    private boolean isBudgetHasExpenses;

    @Column(nullable = false)
    private boolean includeInBudget = false;

    // Notification tracking flags - to prevent duplicate notifications
    @Column(nullable = false)
    private boolean notification50PercentSent = false;

    @Column(nullable = false)
    private boolean notification80PercentSent = false;

    @Column(nullable = false)
    private boolean notification100PercentSent = false;

    public void deductAmount(double expenseAmount) {
        this.amount -= expenseAmount;
    }

    /**
     * Resets notification flags when budget usage decreases below thresholds.
     * Called when expenses are removed or budget amount is increased.
     */
    public void resetNotificationFlags(double currentPercentage) {
        if (currentPercentage < 50.0) {
            this.notification50PercentSent = false;
            this.notification80PercentSent = false;
            this.notification100PercentSent = false;
        } else if (currentPercentage < 80.0) {
            this.notification80PercentSent = false;
            this.notification100PercentSent = false;
        } else if (currentPercentage < 100.0) {
            this.notification100PercentSent = false;
        }
    }
}