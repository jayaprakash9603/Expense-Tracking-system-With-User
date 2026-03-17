package com.jaya.automation.data.factory;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Random;

public final class ExpenseTestDataFactory {
    private static final Random RANDOM = new Random();
    private static final String[] TYPES = {"loss", "gain"};
    private static final String[] PAYMENT_METHODS = {"cash", "creditNeedToPaid", "creditPaid"};

    private ExpenseTestDataFactory() {
    }

    public static Map<String, Object> createPayload() {
        String suffix = String.valueOf(1000 + RANDOM.nextInt(9000));
        Map<String, Object> expense = new LinkedHashMap<>();
        expense.put("expenseName", "Auto Expense " + suffix);
        expense.put("amount", 50 + RANDOM.nextInt(450));
        expense.put("type", TYPES[RANDOM.nextInt(TYPES.length)]);
        expense.put("paymentMethod", PAYMENT_METHODS[RANDOM.nextInt(PAYMENT_METHODS.length)]);
        expense.put("comments", "Created by automation");

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("date", LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE));
        payload.put("includeInBudget", false);
        payload.put("expense", expense);
        return payload;
    }

    public static Map<String, Object> updatePayload(String newName, double newAmount) {
        Map<String, Object> expense = new LinkedHashMap<>();
        expense.put("expenseName", newName);
        expense.put("amount", newAmount);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("expense", expense);
        return payload;
    }
}
