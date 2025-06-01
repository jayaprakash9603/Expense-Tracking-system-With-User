package com.jaya.models;


import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class InvestmentInput {
    @NotEmpty(message = "At least one SIP period is required")
    private List<SipPeriod> sipPeriods;

    private List<LumpsumInvestment> lumpsumInvestments;

    @NotNull(message = "Inflation rate is required")
    @Min(value = 0, message = "Inflation rate must be non-negative")
    private double inflationRate;

    // Getters and Setters
    public List<SipPeriod> getSipPeriods() {
        return sipPeriods;
    }

    public void setSipPeriods(List<SipPeriod> sipPeriods) {
        this.sipPeriods = sipPeriods;
    }

    public List<LumpsumInvestment> getLumpsumInvestments() {
        return lumpsumInvestments;
    }

    public void setLumpsumInvestments(List<LumpsumInvestment> moves) {
        this.lumpsumInvestments = moves;
    }

    public double getInflationRate() {
        return inflationRate;
    }

    public void setInflationRate(double inflationRate) {
        this.inflationRate = inflationRate;
    }
}