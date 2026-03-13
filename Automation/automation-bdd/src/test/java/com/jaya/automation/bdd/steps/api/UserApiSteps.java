package com.jaya.automation.bdd.steps.api;

import com.jaya.automation.api.execution.ApiExecutionResult;
import com.jaya.automation.api.execution.ApiRequestBuilder;
import com.jaya.automation.bdd.context.BddWorld;
import com.jaya.automation.bdd.steps.common.StepDataSupport;
import io.cucumber.java.en.Given;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.function.Consumer;

public class UserApiSteps extends StepDataSupport {
    @Given("a disposable user is created with aliases {string}, {string}, {string}")
    public void createDisposableUserWithAliases(String idAlias, String emailAlias, String tokenAlias) {
        CreatedUser createdUser = createDisposableUser();
        storeAlias(idAlias, createdUser.id());
        storeAlias(emailAlias, createdUser.email());
        BddWorld.apiScenarioContext().putTokenAlias(tokenAlias, createdUser.token());
        storeAlias("token." + tokenAlias, createdUser.token());
    }

    @Given("the current user id is stored as {string}")
    public void currentUserIdIsStoredAs(String alias) {
        ApiExecutionResult profile = execute("user.profile", currentToken(), builder -> {
        });
        ensureStatus(profile, 200);
        Integer userId = intValue(profile, "id", "Current user id is missing");
        storeAlias(alias, userId);
    }

    @Given("a different user id from alias {string} is stored as {string}")
    public void differentUserIdIsStoredAs(String currentAlias, String targetAlias) {
        Integer currentUserId = toInteger(aliasValue(currentAlias));
        Integer differentUserId = resolveDifferentUserId(currentUserId);
        storeAlias(targetAlias, differentUserId);
    }

    @Given("the {string} role id is stored as {string}")
    public void roleIdIsStoredAs(String roleName, String alias) {
        storeAlias(alias, resolveRoleId(roleName));
    }

    @Given("the ADMIN role id is stored as {string}")
    public void adminRoleIdIsStoredAs(String alias) {
        roleIdIsStoredAs("ADMIN", alias);
    }

    @Given("role add conflict aliases are prepared as {string} and {string}")
    public void roleAddConflictAliasesArePrepared(String userIdAlias, String roleIdAlias) {
        CreatedUser createdUser = createDisposableUser();
        storeAlias(userIdAlias, createdUser.id());
        storeAlias(roleIdAlias, resolveRoleId("USER"));
    }

    @Given("role remove conflict aliases are prepared as {string} and {string}")
    public void roleRemoveConflictAliasesArePrepared(String userIdAlias, String roleIdAlias) {
        CreatedUser createdUser = createDisposableUser();
        Integer adminRoleId = resolveRoleId("ADMIN");
        ApiExecutionResult addRole = execute("user.assign-role", adminToken(), builder -> builder
                .pathParam("userId", String.valueOf(createdUser.id()))
                .pathParam("roleId", String.valueOf(adminRoleId)));
        ensureStatus(addRole, 200);
        storeAlias(userIdAlias, createdUser.id());
        storeAlias(roleIdAlias, createAdditionalRoleId());
    }

    @Given("remove last role aliases are prepared as {string} and {string}")
    public void removeLastRoleAliasesArePrepared(String userIdAlias, String roleIdAlias) {
        CreatedUser createdUser = createDisposableUser();
        storeAlias(userIdAlias, createdUser.id());
        storeAlias(roleIdAlias, resolveRoleId("USER"));
    }

    @Given("store response field {string} as mfa secret alias {string}")
    public void storeResponseFieldAsMfaSecretAlias(String jsonPath, String secretAlias) {
        String secret = stringValue(BddWorld.apiExecutionResult(), jsonPath, "MFA secret is missing");
        storeAlias(secretAlias, secret);
    }

    @Given("generate mfa otp from alias {string} as {string}")
    public void generateMfaOtpFromAlias(String secretAlias, String otpAlias) {
        String secret = String.valueOf(aliasValue(secretAlias));
        storeAlias(otpAlias, generateOtp(secret));
    }

    private CreatedUser createDisposableUser() {
        String email = "automation.user+" + UUID.randomUUID().toString().substring(0, 8) + "@example.test";
        Map<String, Object> signupPayload = Map.of(
                "firstName", "Auto",
                "lastName", "User",
                "email", email,
                "password", "ChangeMe123!"
        );
        ApiExecutionResult signup = execute("auth.signup", "", builder -> builder.body(signupPayload));
        ensureStatus(signup, 200, 201);
        String token = stringValue(signup, "jwt", "Signup token is missing");
        ApiExecutionResult profile = execute("user.profile", token, builder -> {
        });
        ensureStatus(profile, 200);
        Integer id = intValue(profile, "id", "Disposable user id is missing");
        trackCleanupId("cleanup.disposableUserIds", id);
        return new CreatedUser(id, email, token);
    }

    private Integer resolveDifferentUserId(Integer currentUserId) {
        ApiExecutionResult usersResponse = execute("user.all", "", builder -> {
        });
        ensureStatus(usersResponse, 200);
        List<Map<String, Object>> users = usersResponse.response().jsonPath().getList("$");
        for (Map<String, Object> user : users) {
            Integer id = toInteger(user.get("id"));
            if (id != null && !id.equals(currentUserId)) {
                return id;
            }
        }
        return createDisposableUser().id();
    }

    private Integer resolveRoleId(String roleName) {
        ApiExecutionResult roleList = execute("roles.list", adminToken(), builder -> {
        });
        ensureStatus(roleList, 200);
        Integer existing = roleIdFromList(roleList, roleName);
        if (existing != null) {
            return existing;
        }
        ApiExecutionResult created = createRole(roleName);
        ensureStatus(created, 200, 201, 409);
        Integer id = intValue(created, "id", "");
        return id != null ? id : roleIdFromList(execute("roles.list", adminToken(), builder -> {
        }), roleName);
    }

    private Integer createAdditionalRoleId() {
        String roleName = "AUTO_ROLE_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
        ApiExecutionResult created = createRole(roleName);
        ensureStatus(created, 200, 201, 409);
        Integer id = intValue(created, "id", "");
        if (id != null) {
            trackCleanupId("cleanup.disposableRoleIds", id);
            return id;
        }
        Integer resolved = roleIdFromList(execute("roles.list", adminToken(), builder -> {
        }), roleName);
        if (resolved != null) {
            return resolved;
        }
        throw new IllegalStateException("Unable to resolve role id for role: " + roleName);
    }

    private ApiExecutionResult createRole(String roleName) {
        Map<String, Object> body = Map.of("name", normalizeRoleName(roleName), "description", "Automation generated role");
        return execute("roles.create", adminToken(), builder -> builder.body(body));
    }

    private Integer roleIdFromList(ApiExecutionResult roleList, String roleName) {
        List<Map<String, Object>> roles = roleList.response().jsonPath().getList("$");
        String expectedName = normalizeRoleName(roleName);
        for (Map<String, Object> role : roles) {
            String actualName = String.valueOf(role.get("name"));
            if (normalizeRoleName(actualName).equals(expectedName)) {
                return toInteger(role.get("id"));
            }
        }
        return null;
    }

    private String normalizeRoleName(String roleName) {
        String normalized = roleName.toUpperCase(Locale.ROOT).trim();
        if (normalized.startsWith("ROLE_")) {
            return normalized.substring(5);
        }
        return normalized;
    }

    private ApiExecutionResult execute(String endpointKey, String token, Consumer<ApiRequestBuilder> customizer) {
        ApiRequestBuilder requestBuilder = ApiRequestBuilder.forEndpoint(endpointKey);
        customizer.accept(requestBuilder);
        return BddWorld.apiRequestExecutor().execute(requestBuilder.build(), token);
    }

    private String currentToken() {
        try {
            return BddWorld.jwtToken();
        } catch (Exception exception) {
            return BddWorld.tokenProvider().token("user");
        }
    }

    private String adminToken() {
        return BddWorld.apiScenarioContext().tokenAlias("admin")
                .orElseGet(() -> BddWorld.tokenProvider().token("admin"));
    }

    private void ensureStatus(ApiExecutionResult result, int... allowedStatuses) {
        for (int allowedStatus : allowedStatuses) {
            if (result.statusCode() == allowedStatus) {
                return;
            }
        }
        throw new AssertionError("Unexpected status: " + result.statusCode() + " for endpoint " + result.endpointKey());
    }

    private String stringValue(ApiExecutionResult result, String jsonPath, String message) {
        Object value = result.jsonPathValue(jsonPath).orElse(null);
        if (value != null) {
            return String.valueOf(value);
        }
        throw new IllegalStateException(message);
    }

    private Integer intValue(ApiExecutionResult result, String jsonPath, String message) {
        Object value = result.jsonPathValue(jsonPath).orElse(null);
        Integer parsed = toInteger(value);
        if (parsed != null) {
            return parsed;
        }
        if (!message.isBlank()) {
            throw new IllegalStateException(message);
        }
        return null;
    }

    private Object aliasValue(String alias) {
        return BddWorld.aliasValue(alias)
                .orElseThrow(() -> new IllegalArgumentException("Missing alias value: " + alias));
    }

    private Integer toInteger(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value == null) {
            return null;
        }
        return Integer.parseInt(String.valueOf(value));
    }

    private void storeAlias(String alias, Object value) {
        BddWorld.apiScenarioContext().putAlias(alias, value);
        BddWorld.putAliasValue(alias, value);
    }

    private void trackCleanupId(String alias, Integer value) {
        String current = BddWorld.aliasValue(alias).map(String::valueOf).orElse("");
        String updated = current.isBlank() ? String.valueOf(value) : current + "," + value;
        storeAlias(alias, updated);
    }

    private String generateOtp(String secret) {
        long epochWindow = System.currentTimeMillis() / 30000L;
        byte[] counter = ByteBuffer.allocate(8).putLong(epochWindow).array();
        byte[] key = secret.getBytes(StandardCharsets.UTF_8);
        try {
            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(key, "HmacSHA1"));
            byte[] hash = mac.doFinal(counter);
            int offset = hash[hash.length - 1] & 0x0F;
            int binary = ((hash[offset] & 0x7F) << 24)
                    | ((hash[offset + 1] & 0xFF) << 16)
                    | ((hash[offset + 2] & 0xFF) << 8)
                    | (hash[offset + 3] & 0xFF);
            int otp = binary % 1_000_000;
            return String.format("%06d", otp);
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to generate MFA OTP", exception);
        }
    }

    private record CreatedUser(Integer id, String email, String token) {
    }
}
