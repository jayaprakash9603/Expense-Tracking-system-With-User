package com.jaya.models;


import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class SipPeriod {
    @NotNull(message = "SIP amount is required")
    @Min(value = 0, message = "SIP amount must be non-negative")
    private double amount;

    @NotNull(message = "SIP period is required")
    @Min(value = 1, message = "SIP period must be at least 1 month")
    private int totalMonths;

    @NotNull(message = "Step-up percentage is required")
    @Min(value = 0, message = "Step-up percentage must be non-negative")
    private double stepUpRate;

    @NotNull(message = "Annual return rate is required")
    @Min(value = 0, message = "Annual return rate must be non-negative")
    private double annualReturnRate;

    @NotNull(message = "Step-up interval is required")
    @Min(value = 1, message = "Step-up interval must be at least 1 month")
    private int stepUpIntervalMonths;

    // Getters and Setters
    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public int getTotalMonths() {
        return totalMonths;
    }

    public void setTotalMonths(int months) {
        this.totalMonths = months;
    }

    public double getStepUpRate() {
        return stepUpRate;
    }

    public void setStepUpRate(double percentage) {
        this.stepUpRate = percentage;
    }

    public double getAnnualReturnRate() {
        return annualReturnRate;
    }

    public void setAnnualReturnRate(double annualReturnRate) {
        this.annualReturnRate = annualReturnRate;
    }

    public int getStepUpIntervalMonths() {
        return stepUpIntervalMonths;
    }

    public void setStepUpIntervalMonths(int stepUpIntervalMonths) {
        this.stepUpIntervalMonths = stepUpIntervalMonths;
    }
}