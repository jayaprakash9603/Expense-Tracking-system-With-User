package com.jaya.service.expenses.vo;

import lombok.Builder;
import lombok.Value;
import java.math.BigDecimal;




@Value
@Builder
public class CreditCalculationResult {
    BigDecimal creditDue;
    BigDecimal currentMonthCreditDue;
    BigDecimal creditPaid;
    BigDecimal totalCreditNeedToPaid;

    public BigDecimal getTotalCredit() {
        return creditDue.add(currentMonthCreditDue);
    }

    public BigDecimal getRemainingCredit() {
        return getTotalCredit().subtract(creditPaid);
    }

    public boolean hasCreditDue() {
        return creditDue.compareTo(BigDecimal.ZERO) > 0;
    }

    public boolean hasCurrentMonthCredit() {
        return currentMonthCreditDue.compareTo(BigDecimal.ZERO) > 0;
    }
}
