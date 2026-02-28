package com.jaya.service.expenses.vo;

import lombok.Builder;
import lombok.Value;
import com.jaya.models.CashSummary;
import java.math.BigDecimal;
import java.util.Map;




@Value
@Builder
public class ExpenseCalculationResult {
    BigDecimal totalGain;
    BigDecimal totalLoss;
    BigDecimal totalCreditPaid;
    Map<String, BigDecimal> categoryBreakdown;
    CashSummary cashSummary;

    public BigDecimal getNetAmount() {
        return totalGain.subtract(totalLoss);
    }

    public boolean hasGains() {
        return totalGain.compareTo(BigDecimal.ZERO) > 0;
    }

    public boolean hasLosses() {
        return totalLoss.compareTo(BigDecimal.ZERO) > 0;
    }

    public BigDecimal getTotalByCategory(String category) {
        return categoryBreakdown.getOrDefault(category, BigDecimal.ZERO);
    }
}

