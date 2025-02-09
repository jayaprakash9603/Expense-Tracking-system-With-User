// ExpenseDetailsDTO.java
package com.jaya.dto;

import lombok.Data;

@Data
public class ExpenseDetailsDTO {
    private Integer id;
    private String expenseName;
    private double amount;
    private String type;
    private String paymentMethod;
    private double netAmount;
    private String comments;
    private double creditDue;
    
    
    
    @Override
    public String toString() {
        return "ExpenseDetailsDTO{" +
                "id=" + id +
                ", expenseName='" + expenseName + '\'' +
                ", amount=" + amount +
                ", type='" + type + '\'' +
                ", paymentMethod='" + paymentMethod + '\'' +
                ", netAmount=" + netAmount +
                ", comments='" + comments + '\'' +
                ", creditDue=" + creditDue +
                '}';
    }
}