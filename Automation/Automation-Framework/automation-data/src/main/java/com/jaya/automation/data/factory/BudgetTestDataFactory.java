package com.jaya.automation.data.factory;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Random;

public final class BudgetTestDataFactory {
    private static final Random RANDOM = new Random();

    private BudgetTestDataFactory() {
    }

    public static Map<String, Object> createPayload() {
        String suffix = String.valueOf(1000 + RANDOM.nextInt(9000));
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("name", "Auto Budget " + suffix);
        payload.put("amount", 1000 + RANDOM.nextInt(9000));
        payload.put("startDate", LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE));
        payload.put("endDate", LocalDate.now().plusDays(30).format(DateTimeFormatter.ISO_LOCAL_DATE));
        payload.put("description", "Created by automation");
        return payload;
    }

    public static Map<String, Object> updatePayload(String newName, double newAmount) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("name", newName);
        payload.put("amount", newAmount);
        return payload;
    }
}
