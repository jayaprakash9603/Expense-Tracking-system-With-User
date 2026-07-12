package com.jaya.automation.data.factory;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Random;

public final class PaymentMethodTestDataFactory {
    private static final Random RANDOM = new Random();
    private static final String[] TYPES = {"credit_card", "debit_card", "cash", "bank_transfer", "upi"};

    private PaymentMethodTestDataFactory() {
    }

    public static Map<String, Object> createPayload() {
        String suffix = String.valueOf(1000 + RANDOM.nextInt(9000));
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("name", "Auto Payment " + suffix);
        payload.put("type", TYPES[RANDOM.nextInt(TYPES.length)]);
        return payload;
    }

    public static Map<String, Object> updatePayload(String newName, String newType) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("name", newName);
        payload.put("type", newType);
        return payload;
    }
}
