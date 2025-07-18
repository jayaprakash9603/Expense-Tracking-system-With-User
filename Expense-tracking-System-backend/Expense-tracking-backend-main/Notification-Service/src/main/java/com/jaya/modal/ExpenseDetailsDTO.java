package com.jaya.modal;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseDetailsDTO {

    private Integer id;
    private String expenseName;
    private double amount;
    private String type;
    private String paymentMethod;
    private double netAmount;
    private String comments;
    private double creditDue;
    private Integer expenseId;
}