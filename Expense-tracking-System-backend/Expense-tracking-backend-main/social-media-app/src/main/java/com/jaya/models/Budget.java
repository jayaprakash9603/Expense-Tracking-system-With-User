package com.jaya.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    private double amount;
    private LocalDate startDate;
    private LocalDate endDate;

    // Many-to-one relationship with User
    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    // Method to deduct expenses from the budget
    public void deductAmount(double expenseAmount) {
        this.amount -= expenseAmount;
    }

    // Method to check if the budget is still valid (i.e., within the date range)
    public boolean isBudgetValid() {
        LocalDate today = LocalDate.now();
        return today.isAfter(startDate) && today.isBefore(endDate);
    }
}
