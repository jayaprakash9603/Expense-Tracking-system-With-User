package com.jaya.automation.data.factory;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

public final class UserTestDataFactory {
    private static final Random RANDOM = new Random();

    private UserTestDataFactory() {
    }

    public static Map<String, Object> signupPayload() {
        String suffix = String.valueOf(1000 + RANDOM.nextInt(9000));
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("firstName", "AutoTest");
        payload.put("lastName", "User" + suffix);
        payload.put("email", "autotest_" + UUID.randomUUID().toString().substring(0, 8) + "@test.com");
        payload.put("password", "TestPass@" + suffix);
        payload.put("gender", "male");
        return payload;
    }

    public static Map<String, Object> signinPayload(String email, String password) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("email", email);
        payload.put("password", password);
        return payload;
    }
}
