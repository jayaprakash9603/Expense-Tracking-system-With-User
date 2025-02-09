package com.jaya.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "expense_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    private String expenseName;
    private double amount;
    private String type;
    private String paymentMethod;
    private double netAmount;
    private String comments;
    private double creditDue;

    // This side owns the relationship, so we use @JoinColumn to specify the foreign key
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "expense_id")
    @JsonBackReference
    private Expense expense;



}
