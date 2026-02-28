package com.jaya.util;

import org.springframework.stereotype.Component;

@Component
public class DataMaskingUtil {

    private static final String MASKED_AMOUNT = "*****";
    private static final String MASKED_PARTIAL_PREFIX = "***";

    public String maskAmount(double amount) {
        return MASKED_AMOUNT;
    }

    public String maskAmountPartial(double amount) {
        String amountStr = String.format("%.2f", amount);
        if (amountStr.length() <= 5) {
            return MASKED_AMOUNT;
        }
        int visibleLength = 5;
        return MASKED_PARTIAL_PREFIX + amountStr.substring(amountStr.length() - visibleLength);
    }

    public double getMaskedNumericValue() {
        return 0.0;
    }

    public boolean shouldMaskData(Boolean maskSensitiveData) {
        return maskSensitiveData != null && maskSensitiveData;
    }

    public String maskCreditDue(double creditDue) {
        if (creditDue == 0.0) {
            return "0.00";
        }
        return MASKED_AMOUNT;
    }

    public String maskAmountConditional(double amount, Boolean maskSensitiveData, boolean partialMask) {
        if (!shouldMaskData(maskSensitiveData)) {
            return String.format("%.2f", amount);
        }
        return partialMask ? maskAmountPartial(amount) : maskAmount(amount);
    }
}
