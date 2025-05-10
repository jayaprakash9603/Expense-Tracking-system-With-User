package com.jaya.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


import java.time.LocalDate;
import java.util.*;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
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


    private Set<Integer> budgetIds=new HashSet<>();

    // One-to-one relationship, mappedBy indicates that this side doesn't own the relationship
    @OneToOne(mappedBy = "expense", cascade = CascadeType.ALL)
    @JsonManagedReference
    private ExpenseDetails expense;

    @JsonIgnore
    @ManyToOne
    private User user;
    
}
