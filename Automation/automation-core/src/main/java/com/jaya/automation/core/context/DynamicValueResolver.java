package com.jaya.automation.core.context;

import java.security.SecureRandom;
import java.time.Clock;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.function.Function;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class DynamicValueResolver {
    private static final Pattern PLACEHOLDER_PATTERN = Pattern.compile("\\$\\{([^}]+)}");
    private static final Pattern NOW_TOKEN_PATTERN = Pattern.compile("now([+-]\\d+[dhms])?(?::(.+))?");
    private static final String DEFAULT_EMAIL_DOMAIN = "example.test";
    private static final int DEFAULT_NUMBER_LENGTH = 6;

    private final Function<String, Optional<String>> contextLookup;
    private final Function<String, Optional<String>> suiteLookup;
    private final Clock clock;
    private final Random random;

    public DynamicValueResolver(
            Function<String, Optional<String>> contextLookup,
            Function<String, Optional<String>> suiteLookup
    ) {
        this(contextLookup, suiteLookup, Clock.systemUTC(), new SecureRandom());
    }

    DynamicValueResolver(
            Function<String, Optional<String>> contextLookup,
            Function<String, Optional<String>> suiteLookup,
            Clock clock,
            Random random
    ) {
        this.contextLookup = contextLookup;
        this.suiteLookup = suiteLookup;
        this.clock = clock;
        this.random = random;
    }

    public String resolve(String value) {
        if (value == null || value.isBlank()) {
            return value;
        }
        if (value.startsWith("ctx.")) {
            return contextValue(value.substring(4));
        }
        if (value.startsWith("suite.")) {
            return suiteValue(value.substring(6));
        }
        Matcher matcher = PLACEHOLDER_PATTERN.matcher(value);
        StringBuffer resolvedText = new StringBuffer();
        while (matcher.find()) {
            String token = matcher.group(1).trim();
            String replacement = resolveToken(token);
            matcher.appendReplacement(resolvedText, Matcher.quoteReplacement(replacement));
        }
        matcher.appendTail(resolvedText);
        return resolvedText.toString();
    }

    public Map<String, String> resolveTextMap(Map<String, String> values) {
        Map<String, String> resolvedValues = new LinkedHashMap<>();
        values.forEach((key, value) -> resolvedValues.put(key, resolve(value)));
        return resolvedValues;
    }

    private String resolveToken(String token) {
        if (token.startsWith("ctx.")) {
            return contextValue(token.substring(4));
        }
        if (token.startsWith("suite.")) {
            return suiteValue(token.substring(6));
        }
        if (token.startsWith("random.")) {
            return randomValue(token.substring(7));
        }
        if (token.startsWith("now")) {
            return nowValue(token);
        }
        throw new IllegalArgumentException("Unsupported dynamic token: " + token);
    }

    private String contextValue(String key) {
        return contextLookup.apply(key)
                .orElseThrow(() -> new IllegalArgumentException("Missing context alias: " + key));
    }

    private String suiteValue(String key) {
        return suiteLookup.apply(key)
                .orElseThrow(() -> new IllegalArgumentException("Missing suite data alias: " + key));
    }

    private String randomValue(String type) {
        if (type.startsWith("number")) {
            return randomNumber(numberLength(type));
        }
        if ("uuid".equals(type)) {
            return java.util.UUID.randomUUID().toString();
        }
        if ("email".equals(type)) {
            return "user-" + randomNumber(8) + "@" + DEFAULT_EMAIL_DOMAIN;
        }
        throw new IllegalArgumentException("Unsupported random token: " + type);
    }

    private String nowValue(String token) {
        Matcher matcher = NOW_TOKEN_PATTERN.matcher(token);
        if (!matcher.matches()) {
            throw new IllegalArgumentException("Unsupported now token: " + token);
        }
        OffsetDateTime dateTime = OffsetDateTime.now(clock);
        String offsetPart = matcher.group(1);
        if (offsetPart != null && !offsetPart.isBlank()) {
            dateTime = applyOffset(dateTime, offsetPart);
        }
        String formatPart = matcher.group(2);
        if (formatPart == null || formatPart.isBlank()) {
            return dateTime.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
        }
        return dateTime.format(DateTimeFormatter.ofPattern(formatPart));
    }

    private OffsetDateTime applyOffset(OffsetDateTime source, String offsetToken) {
        int signedValue = Integer.parseInt(offsetToken.substring(0, offsetToken.length() - 1));
        char unit = offsetToken.charAt(offsetToken.length() - 1);
        return switch (unit) {
            case 'd' -> source.plusDays(signedValue);
            case 'h' -> source.plusHours(signedValue);
            case 'm' -> source.plusMinutes(signedValue);
            case 's' -> source.plusSeconds(signedValue);
            default -> throw new IllegalArgumentException("Unsupported now offset unit: " + unit);
        };
    }

    private int numberLength(String token) {
        if (!token.contains(":")) {
            return DEFAULT_NUMBER_LENGTH;
        }
        String lengthValue = token.substring(token.indexOf(':') + 1);
        int parsedLength = Integer.parseInt(lengthValue);
        return Math.max(parsedLength, 1);
    }

    private String randomNumber(int length) {
        StringBuilder builder = new StringBuilder(length);
        for (int index = 0; index < length; index++) {
            builder.append(random.nextInt(10));
        }
        return builder.toString();
    }
}
