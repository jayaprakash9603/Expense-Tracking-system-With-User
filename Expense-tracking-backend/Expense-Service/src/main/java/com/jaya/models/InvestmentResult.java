package com.jaya.models;


import java.util.List;

public class InvestmentResult {
    private double totalFutureValue; 
    private double realFutureValue; 
    private List<SipContribution> sipContributions;
    private List<LumpsumContribution> lumpsumContributions;

    public static class SipContribution {
        private double initialAmount;
        private int totalMonths;
        private double stepUpRate;
        private double annualRate;
        private int stepUpIntervalMonths;
        private double futureValue;

        public SipContribution(double initialAmount, int totalMonths, double stepUpRate, double annualRate, int stepUpIntervalMonths, double futureValue) {
            this.initialAmount = initialAmount;
            this.totalMonths = totalMonths;
            this.stepUpRate = stepUpRate;
            this.annualRate = annualRate;
            this.stepUpIntervalMonths = stepUpIntervalMonths;
            this.futureValue = futureValue;
        }

        public double getInitialAmount() {
            return initialAmount;
        }

        public int getTotalMonths() {
            return totalMonths;
        }

        public double getStepUpRate() {
            return stepUpRate;
        }

        public double getAnnualRate() {
            return annualRate;
        }

        public int getStepUpIntervalMonths() {
            return stepUpIntervalMonths;
        }

        public double getFutureValue() {
            return futureValue;
        }
    }

    public static class LumpsumContribution {
        private double amount;
        private int month;
        private double futureValue;

        public LumpsumContribution(double amount, int month, double futureValue) {
            this.amount = amount;
            this.month = month;
            this.futureValue = futureValue;
        }

        public double getAmount() {
            return amount;
        }

        public int getMonth() {
            return month;
        }

        public double getFutureValue() {
            return futureValue;
        }
    }

    
    public double getTotalFutureValue() {
        return totalFutureValue;
    }

    public void setTotalFutureValue(double totalFutureValue) {
        this.totalFutureValue = totalFutureValue;
    }

    public double getRealFutureValue() {
        return realFutureValue;
    }

    public void setRealFutureValue(double realFutureValue) {
        this.realFutureValue = realFutureValue;
    }

    public List<SipContribution> getSipContributions() {
        return sipContributions;
    }

    public void setSipContributions(List<SipContribution> sipContributions) {
        this.sipContributions = sipContributions;
    }

    public List<LumpsumContribution> getLumpsumContributions() {
        return lumpsumContributions;
    }

    public void setLumpsumContributions(List<LumpsumContribution> moves) {
        this.lumpsumContributions = moves;
    }
}