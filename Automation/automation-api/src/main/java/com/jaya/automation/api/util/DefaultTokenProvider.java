package com.jaya.automation.api.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.automation.api.config.ApiSpecifications;
import com.jaya.automation.core.config.AutomationConfig;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import static io.restassured.RestAssured.given;

public final class DefaultTokenProvider implements TokenProvider {
    private static final String DEFAULT_JWT_SECRET = "your-secret-key-for-jwt-token-generation-min-256-bits";
    private static final String INVALID_TOKEN = "invalid.token.value";
    private static final String HMAC_SHA_256 = "HmacSHA256";

    private final AutomationConfig automationConfig;
    private final SessionTokenHelper sessionTokenHelper;
    private final RequestSpecification requestSpecification;
    private final ObjectMapper objectMapper;
    private final Map<String, String> tokenCache;

    public DefaultTokenProvider(AutomationConfig automationConfig, SessionTokenHelper sessionTokenHelper) {
        this.automationConfig = automationConfig;
        this.sessionTokenHelper = sessionTokenHelper;
        this.requestSpecification = new ApiSpecifications(automationConfig).requestSpec();
        this.objectMapper = new ObjectMapper();
        this.tokenCache = new ConcurrentHashMap<>();
    }

    @Override
    public String token(String alias) {
        String normalizedAlias = normalizeAlias(alias);
        return tokenCache.computeIfAbsent(normalizedAlias, this::resolveToken);
    }

    private String resolveToken(String alias) {
        if ("invalid".equals(alias)) {
            return readValue("TEST_INVALID_JWT", INVALID_TOKEN);
        }
        if ("expired".equals(alias)) {
            return resolveExpiredToken();
        }
        String configuredToken = configuredToken(alias);
        if (!configuredToken.isBlank()) {
            return configuredToken;
        }
        Credentials credentials = credentials(alias);
        String signedInToken = signInToken(credentials);
        if (hasText(signedInToken)) {
            return signedInToken;
        }
        return provisionToken(alias, credentials);
    }

    private String resolveExpiredToken() {
        String configuredToken = readValue("TEST_EXPIRED_JWT", "");
        if (!configuredToken.isBlank()) {
            return configuredToken;
        }
        String email = firstNonBlank(
                readValue("TEST_USER_USERNAME", ""),
                automationConfig.testUsername(),
                "expired.user@example.test"
        );
        String secret = readValue("JWT_SECRET", DEFAULT_JWT_SECRET);
        return expiredJwt(email, "ROLE_USER", secret);
    }

    private String configuredToken(String alias) {
        if ("admin".equals(alias)) {
            return readValue("TEST_ADMIN_JWT", "");
        }
        if ("user".equals(alias)) {
            return readValue("TEST_USER_JWT", "");
        }
        return "";
    }

    private String signInToken(Credentials credentials) {
        if (!hasText(credentials.username()) || !hasText(credentials.password())) {
            return "";
        }
        try {
            return sessionTokenHelper.signIn(credentials.username(), credentials.password());
        } catch (IllegalStateException exception) {
            return "";
        }
    }

    private String provisionToken(String alias, Credentials credentials) {
        SignupAccount account = signupAccount(alias, credentials);
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("firstName", account.firstName());
        payload.put("lastName", account.lastName());
        payload.put("email", account.email());
        payload.put("password", account.password());
        payload.put("roles", account.roles());
        Response response = given()
                .spec(requestSpecification)
                .body(payload)
                .when()
                .post("/auth/signup");
        String jwt = jsonValue(response, "jwt");
        if (hasText(jwt)) {
            return jwt;
        }
        if (response.statusCode() == 409) {
            String duplicateToken = signInToken(new Credentials(account.email(), account.password()));
            if (hasText(duplicateToken)) {
                return duplicateToken;
            }
        }
        String details = firstNonBlank(
                jsonValue(response, "message"),
                jsonValue(response, "details"),
                response.body().asString()
        );
        throw new IllegalStateException(
                "Unable to resolve token alias " + alias + ". Signup fallback status " + response.statusCode()
                        + ": " + details
        );
    }

    private SignupAccount signupAccount(String alias, Credentials credentials) {
        String email = generatedEmail(alias);
        String password = firstNonBlank(credentials.password(), readValue("TEST_SIGNUP_PASSWORD", "ChangeMe123!"));
        List<String> roles = "admin".equals(alias) ? List.of("ADMIN") : List.of("USER");
        String firstName = "admin".equals(alias) ? "AutoAdmin" : "AutoUser";
        String lastName = "Automation";
        return new SignupAccount(email, password, firstName, lastName, roles);
    }

    private String generatedEmail(String alias) {
        return "auto-" + alias + "-" + UUID.randomUUID().toString().substring(0, 8) + "@example.test";
    }

    private String jsonValue(Response response, String path) {
        try {
            Object value = response.jsonPath().get(path);
            return value == null ? null : String.valueOf(value);
        } catch (Exception exception) {
            return null;
        }
    }

    private Credentials credentials(String alias) {
        if ("admin".equals(alias)) {
            return adminCredentials();
        }
        return userCredentials();
    }

    private Credentials userCredentials() {
        String username = firstNonBlank(readValue("TEST_USER_USERNAME", ""), automationConfig.testUsername());
        String password = firstNonBlank(readValue("TEST_USER_PASSWORD", ""), automationConfig.testPassword());
        return new Credentials(username, password);
    }

    private Credentials adminCredentials() {
        String username = firstNonBlank(
                readValue("TEST_ADMIN_USERNAME", ""),
                readValue("TEST_USER_USERNAME", ""),
                automationConfig.testUsername()
        );
        String password = firstNonBlank(
                readValue("TEST_ADMIN_PASSWORD", ""),
                readValue("TEST_USER_PASSWORD", ""),
                automationConfig.testPassword()
        );
        return new Credentials(username, password);
    }

    private String readValue(String key, String fallback) {
        String property = System.getProperty(key);
        if (hasText(property)) {
            return property.trim();
        }
        String environment = System.getenv(key);
        if (hasText(environment)) {
            return environment.trim();
        }
        return fallback;
    }

    private String normalizeAlias(String alias) {
        if (!hasText(alias)) {
            return "user";
        }
        String normalized = alias.trim().toLowerCase(Locale.ROOT);
        if ("default".equals(normalized)) {
            return "user";
        }
        return normalized;
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (hasText(value)) {
                return value.trim();
            }
        }
        return "";
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String expiredJwt(String email, String authorities, String secret) {
        long nowEpochSeconds = Instant.now().getEpochSecond();
        String header = base64UrlJson(Map.of("alg", "HS256", "typ", "JWT"));
        String payload = base64UrlJson(expiredPayload(email, authorities, nowEpochSeconds));
        String signature = sign(header + "." + payload, secret);
        return header + "." + payload + "." + signature;
    }

    private Map<String, Object> expiredPayload(String email, String authorities, long nowEpochSeconds) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("email", email);
        payload.put("authorities", authorities);
        payload.put("token_type", "STANDARD");
        payload.put("iat", nowEpochSeconds - 3600);
        payload.put("exp", nowEpochSeconds - 60);
        return payload;
    }

    private String base64UrlJson(Map<String, Object> payload) {
        try {
            byte[] bytes = objectMapper.writeValueAsBytes(payload);
            return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Unable to serialize JWT payload", exception);
        }
    }

    private String sign(String content, String secret) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA_256);
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_SHA_256));
            byte[] signature = mac.doFinal(content.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(signature);
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to sign JWT token", exception);
        }
    }

    private record Credentials(String username, String password) {
    }

    private record SignupAccount(String email, String password, String firstName, String lastName, List<String> roles) {
    }
}
