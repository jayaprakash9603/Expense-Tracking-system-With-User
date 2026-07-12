package com.jaya.automation.data.template;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class PayloadTemplateEngine {

    private static final Logger LOG = LoggerFactory.getLogger(PayloadTemplateEngine.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final Random RANDOM = new Random();

    private static final Pattern PLACEHOLDER_PATTERN = Pattern.compile("\\$\\{([^}]+)}");
    private static final String PAYLOAD_BASE_PATH = "payloads/";

    private PayloadTemplateEngine() {
    }

    public static Map<String, Object> render(String templatePath, Map<String, String> variables) {
        String fullPath = templatePath.startsWith(PAYLOAD_BASE_PATH) ? templatePath : PAYLOAD_BASE_PATH + templatePath;
        String rawJson = loadTemplate(fullPath);
        String resolved = resolvePlaceholders(rawJson, variables);
        return parseJson(resolved);
    }

    public static Map<String, Object> renderInline(String jsonTemplate, Map<String, String> variables) {
        String resolved = resolvePlaceholders(jsonTemplate, variables);
        return parseJson(resolved);
    }

    public static String resolvePlaceholders(String input, Map<String, String> variables) {
        if (input == null) {
            return null;
        }
        Matcher matcher = PLACEHOLDER_PATTERN.matcher(input);
        StringBuilder result = new StringBuilder();
        while (matcher.find()) {
            String expression = matcher.group(1);
            String replacement = resolveExpression(expression, variables);
            matcher.appendReplacement(result, Matcher.quoteReplacement(replacement));
        }
        matcher.appendTail(result);
        return result.toString();
    }

    private static String resolveExpression(String expression, Map<String, String> variables) {
        if (variables.containsKey(expression)) {
            return variables.get(expression);
        }

        if (expression.startsWith("random.number:")) {
            int digits = Integer.parseInt(expression.substring("random.number:".length()));
            return randomNumber(digits);
        }
        if (expression.startsWith("random.string:")) {
            int length = Integer.parseInt(expression.substring("random.string:".length()));
            return randomString(length);
        }
        if (expression.equals("random.uuid")) {
            return UUID.randomUUID().toString();
        }
        if (expression.equals("random.email")) {
            return "testuser_" + randomNumber(6) + "@test.com";
        }

        if (expression.startsWith("now:")) {
            String format = expression.substring("now:".length());
            return LocalDate.now().format(DateTimeFormatter.ofPattern(format));
        }
        if (expression.startsWith("now+")) {
            return resolveDateOffset(expression, true);
        }
        if (expression.startsWith("now-")) {
            return resolveDateOffset(expression, false);
        }
        if (expression.equals("timestamp")) {
            return LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        }

        if (expression.startsWith("suite.")) {
            LOG.debug("Suite variable not resolved: {}", expression);
            return "${" + expression + "}";
        }

        return "${" + expression + "}";
    }

    private static String resolveDateOffset(String expression, boolean add) {
        String offsetPart = add
                ? expression.substring("now+".length())
                : expression.substring("now-".length());
        String[] parts = offsetPart.split(":", 2);
        String offsetSpec = parts[0];
        String format = parts.length > 1 ? parts[1] : "yyyy-MM-dd";

        long amount = Long.parseLong(offsetSpec.replaceAll("[^0-9]", ""));
        char unit = offsetSpec.charAt(offsetSpec.length() - 1);
        LocalDate date = LocalDate.now();

        date = switch (unit) {
            case 'd' -> add ? date.plusDays(amount) : date.minusDays(amount);
            case 'w' -> add ? date.plusWeeks(amount) : date.minusWeeks(amount);
            case 'm', 'M' -> add ? date.plusMonths(amount) : date.minusMonths(amount);
            case 'y' -> add ? date.plusYears(amount) : date.minusYears(amount);
            default -> throw new IllegalArgumentException("Unknown date unit: " + unit);
        };
        return date.format(DateTimeFormatter.ofPattern(format));
    }

    private static String randomNumber(int digits) {
        int bound = (int) Math.pow(10, digits);
        int lower = (int) Math.pow(10, digits - 1);
        return String.valueOf(lower + RANDOM.nextInt(bound - lower));
    }

    private static String randomString(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(RANDOM.nextInt(chars.length())));
        }
        return sb.toString();
    }

    private static String loadTemplate(String classpathPath) {
        try (InputStream stream = Thread.currentThread().getContextClassLoader()
                .getResourceAsStream(classpathPath)) {
            if (stream == null) {
                throw new IllegalArgumentException("Template not found: " + classpathPath);
            }
            return new String(stream.readAllBytes());
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to load template: " + classpathPath, ex);
        }
    }

    private static Map<String, Object> parseJson(String json) {
        try {
            return MAPPER.readValue(json, new TypeReference<LinkedHashMap<String, Object>>() {
            });
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to parse template JSON", ex);
        }
    }
}
