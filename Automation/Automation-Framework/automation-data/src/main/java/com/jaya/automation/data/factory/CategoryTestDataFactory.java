package com.jaya.automation.data.factory;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Random;

public final class CategoryTestDataFactory {
    private static final Random RANDOM = new Random();
    private static final String[] TYPES = {"expense", "income"};

    private CategoryTestDataFactory() {
    }

    public static Map<String, Object> createPayload() {
        String suffix = String.valueOf(1000 + RANDOM.nextInt(9000));
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("categoryName", "Auto Category " + suffix);
        payload.put("description", "Automation test category");
        payload.put("type", TYPES[RANDOM.nextInt(TYPES.length)]);
        return payload;
    }

    public static Map<String, Object> updatePayload(String newName) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("categoryName", newName);
        payload.put("description", "Updated by automation");
        return payload;
    }
}
