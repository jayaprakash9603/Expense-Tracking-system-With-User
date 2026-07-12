package com.jaya.automation.data.factory;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

public final class BillTestDataFactory {
    private static final Random RANDOM = new Random();

    private BillTestDataFactory() {
    }

    public static Map<String, Object> createPayload() {
        return createPayload(2);
    }

    public static Map<String, Object> createPayload(int itemCount) {
        String suffix = String.valueOf(1000 + RANDOM.nextInt(9000));
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("billName", "Auto Bill " + suffix);
        payload.put("description", "Automation test bill");
        payload.put("type", "purchase");

        List<Map<String, Object>> items = new ArrayList<>();
        for (int i = 1; i <= itemCount; i++) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("itemName", "Item " + i);
            item.put("quantity", 1 + RANDOM.nextInt(5));
            item.put("unitPrice", 10.0 + RANDOM.nextInt(90));
            item.put("comments", "Test item " + i);
            items.add(item);
        }
        payload.put("items", items);
        return payload;
    }
}
