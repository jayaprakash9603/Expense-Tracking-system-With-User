package com.jaya.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;
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
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    private LocalDate date;

    @Column(nullable = false)
    private boolean includeInBudget = false;

    @Column(name = "budget_ids", columnDefinition = "LONGBLOB")
    private Set<Integer> budgetIds = new HashSet<>();

    private Integer categoryId = 0;

    @OneToOne(mappedBy = "expense", cascade = CascadeType.ALL)
    @JsonManagedReference
    @ToString.Exclude
    private ExpenseDetails expense;

    @JsonIgnore
    @ManyToOne
    private User user;
}