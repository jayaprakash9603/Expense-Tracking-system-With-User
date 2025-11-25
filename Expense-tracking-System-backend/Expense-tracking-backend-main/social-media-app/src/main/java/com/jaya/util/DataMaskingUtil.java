package com.jaya.util;

import org.springframework.stereotype.Component;

/**
 * DataMaskingUtil - Utility for masking sensitive financial data
 * 
 * Design Pattern: Utility Pattern
 * Purpose: Provides centralized data masking logic for privacy protection
 * Benefits:
 * - Consistent masking across the application
 * - Easy to modify masking strategy
 * - Testable in isolation
 * - Security and privacy compliance
 */
@Component
public class DataMaskingUtil {

    private static final String MASKED_AMOUNT = "*****";
    private static final String MASKED_PARTIAL_PREFIX = "***";

    /**
     * Masks a numeric amount completely
     * 
     * @param amount The amount to mask
     * @return Masked string representation
     */
    public String maskAmount(double amount) {
        return MASKED_AMOUNT;
    }

    /**
     * Masks a numeric amount partially (shows last 2 digits)
     * Example: 1234.56 -> ***34.56
     * 
     * @param amount The amount to mask
     * @return Partially masked string representation
     */
    public String maskAmountPartial(double amount) {
        String amountStr = String.format("%.2f", amount);
        if (amountStr.length() <= 5) { // For small amounts, mask completely
            return MASKED_AMOUNT;
        }
        // Keep last 5 characters (XX.XX)
        int visibleLength = 5;
        return MASKED_PARTIAL_PREFIX + amountStr.substring(amountStr.length() - visibleLength);
    }

    /**
     * Gets masked amount value for calculations (returns 0.0)
     * This is useful when we want to mask the amount but still need a numeric value
     * 
     * @return 0.0 as the masked numeric value
     */
    public double getMaskedNumericValue() {
        return 0.0;
    }

    /**
     * Checks if masking should be applied based on user settings
     * 
     * @param maskSensitiveData User's masking preference
     * @return true if data should be masked, false otherwise
     */
    public boolean shouldMaskData(Boolean maskSensitiveData) {
        return maskSensitiveData != null && maskSensitiveData;
    }

    /**
     * Masks credit due amount
     * 
     * @param creditDue The credit due amount
     * @return Masked string or original value
     */
    public String maskCreditDue(double creditDue) {
        if (creditDue == 0.0) {
            return "0.00";
        }
        return MASKED_AMOUNT;
    }

    /**
     * Conditionally masks amount based on user preference
     * 
     * @param amount           The amount to potentially mask
     * @param maskSensitiveData User's masking preference
     * @param partialMask      Whether to use partial masking
     * @return Masked or original amount as string
     */
    public String maskAmountConditional(double amount, Boolean maskSensitiveData, boolean partialMask) {
        if (!shouldMaskData(maskSensitiveData)) {
            return String.format("%.2f", amount);
        }
        return partialMask ? maskAmountPartial(amount) : maskAmount(amount);
    }
}
