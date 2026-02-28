package com.jaya.models;



import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class LumpsumInvestment {
    @NotNull(message = "Lumpsum amount is required")
    @Min(value = 0, message = "Lumpsum amount must be non-negative")
    private double amount;

    @NotNull(message = "Lumpsum investment time is required")
    @Min(value = 0, message = "Lumpsum investment time must be non-negative")
    private int month;

    
    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public int getMonth() {
        return month;
    }

    public void setMonth(int month) {
        this.month = month;
    }
}
