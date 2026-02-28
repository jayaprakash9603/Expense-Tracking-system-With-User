
package com.jaya.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

@Data
public class ExpenseDetailsDTO {
    private Integer id;
    private String expenseName;
    private Object amount; 
    private String type;
    private String paymentMethod;
    private Object netAmount; 
    private String comments;
    private Object creditDue; 
    private boolean masked = false; 
    
    
    @JsonIgnore
    public double getAmountAsDouble() {
        if (amount instanceof Number) {
            return ((Number) amount).doubleValue();
        }
        return 0.0;
    }
    
    @JsonIgnore
    public double getNetAmountAsDouble() {
        if (netAmount instanceof Number) {
            return ((Number) netAmount).doubleValue();
        }
        return 0.0;
    }
    
    @JsonIgnore
    public double getCreditDueAsDouble() {
        if (creditDue instanceof Number) {
            return ((Number) creditDue).doubleValue();
        }
        return 0.0;
    }
    
    
    
    @Override
    public String toString() {
        return "ExpenseDetailsDTO{" +
                "id=" + id +
                ", expenseName='" + expenseName + '\'' +
                ", amount=" + (masked ? "****" : amount) +
                ", type='" + type + '\'' +
                ", paymentMethod='" + paymentMethod + '\'' +
                ", netAmount=" + (masked ? "****" : netAmount) +
                ", comments='" + comments + '\'' +
                ", creditDue=" + (masked ? "****" : creditDue) +
                ", masked=" + masked +
                '}';
    }
}

