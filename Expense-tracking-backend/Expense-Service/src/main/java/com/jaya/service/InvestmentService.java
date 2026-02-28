package com.jaya.service;


import com.jaya.models.InvestmentInput;
import com.jaya.models.InvestmentResult;
import com.jaya.models.LumpsumInvestment;
import com.jaya.models.SipPeriod;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class InvestmentService {

    public InvestmentResult calculateFutureValue(InvestmentInput input) {
        int totalPeriod = input.getSipPeriods().stream().mapToInt(SipPeriod::getTotalMonths).sum();
        double annualInflationRate = input.getInflationRate() / 100;

        
        if (input.getLumpsumInvestments() != null) {
            for (LumpsumInvestment lumpsum : input.getLumpsumInvestments()) {
                if (lumpsum.getMonth() > totalPeriod) {
                    throw new IllegalArgumentException("Lumpsum investment time exceeds total period");
                }
            }
        }

        
        List<InvestmentResult.SipContribution> sipContributions = new ArrayList<>();
        double totalSipValue = 0;
        int monthsElapsed = 0;
        for (SipPeriod period : input.getSipPeriods()) {
            double monthlyRate = period.getAnnualReturnRate() / 100 / 12;
            double annualStepUpRate = period.getStepUpRate() / 100;
            double fvSip = calculateSipFutureValueWithStepUp(
                    period.getAmount(),
                    period.getTotalMonths(),
                    monthlyRate,
                    annualStepUpRate,
                    period.getStepUpIntervalMonths(),
                    monthsElapsed,
                    input.getSipPeriods(),
                    totalPeriod
            );
            totalSipValue += fvSip;
            sipContributions.add(new InvestmentResult.SipContribution(
                    period.getAmount(),
                    period.getTotalMonths(),
                    period.getStepUpRate(),
                    period.getAnnualReturnRate(),
                    period.getStepUpIntervalMonths(),
                    fvSip
            ));
            monthsElapsed += period.getTotalMonths();
        }

        
        List<InvestmentResult.LumpsumContribution> lumpsumContributions = new ArrayList<>();
        double totalLumpsumValue = 0;
        if (input.getLumpsumInvestments() != null) {
            for (LumpsumInvestment lumpsum : input.getLumpsumInvestments()) {
                double fvLumpsum = calculateLumpsumFutureValue(
                        lumpsum.getAmount(),
                        lumpsum.getMonth(),
                        input.getSipPeriods(),
                        totalPeriod
                );
                totalLumpsumValue += fvLumpsum;
                lumpsumContributions.add(new InvestmentResult.LumpsumContribution(lumpsum.getAmount(), lumpsum.getMonth(), fvLumpsum));
            }
        }

        
        double nominalFutureValue = totalSipValue + totalLumpsumValue;
        double realFutureValue = nominalFutureValue / Math.pow(1 + annualInflationRate, totalPeriod / 12.0);

        
        InvestmentResult result = new InvestmentResult();
        result.setTotalFutureValue(nominalFutureValue);
        result.setRealFutureValue(realFutureValue);
        result.setSipContributions(sipContributions);
        result.setLumpsumContributions(lumpsumContributions);
        return result;
    }

    private double calculateSipFutureValueWithStepUp(double initialMonthlyAmount, int months, double monthlyRate, double annualStepUpRate, int stepUpIntervalMonths, int monthsElapsed, List<SipPeriod> periods, int totalPeriod) {
        if (initialMonthlyAmount == 0 || months == 0) return 0;
        double totalFv = 0;
        double currentMonthlyAmount = initialMonthlyAmount;

        for (int month = 1; month <= months; month++) {
            
            if (month % stepUpIntervalMonths == 1 && month > 1) {
                currentMonthlyAmount *= (1 + annualStepUpRate);
            }
            
            int globalMonth = monthsElapsed + month;
            totalFv += currentMonthlyAmount * calculateCompoundFactor(globalMonth, periods, totalPeriod);
        }
        return totalFv;
    }

    private double calculateLumpsumFutureValue(double amount, int investmentMonth, List<SipPeriod> periods, int totalPeriod) {
        if (amount == 0 || investmentMonth > totalPeriod) return 0;
        return amount * calculateCompoundFactor(investmentMonth, periods, totalPeriod);
    }

    private double calculateCompoundFactor(int startMonth, List<SipPeriod> periods, int totalPeriod) {
        double factor = 1.0;
        int monthsElapsed = 0;
        boolean foundPeriod = false;

        for (SipPeriod period : periods) {
            int periodMonths = period.getTotalMonths();
            double monthlyRate = period.getAnnualReturnRate() / 100 / 12;
            int periodStart = monthsElapsed + 1;
            int periodEnd = monthsElapsed + periodMonths;

            if (startMonth <= periodEnd) {
                foundPeriod = true;
                
                int monthsInPeriod = Math.min(periodEnd - startMonth + 1, totalPeriod - startMonth + 1);
                if (monthsInPeriod > 0) {
                    factor *= Math.pow(1 + monthlyRate, monthsInPeriod);
                }
                
                startMonth += monthsInPeriod;
            }
            monthsElapsed += periodMonths;

            if (startMonth > totalPeriod) break;
        }

        
        if (!foundPeriod && startMonth <= totalPeriod) {
            double defaultRate = periods.get(0).getAnnualReturnRate() / 100 / 12;
            factor *= Math.pow(1 + defaultRate, totalPeriod - startMonth + 1);
        }

        return factor;
    }
}
