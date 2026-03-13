package com.jaya.automation.bdd.hooks;

import com.jaya.automation.api.client.AuthApiClient;
import com.jaya.automation.api.contract.ApiEndpointRegistry;
import com.jaya.automation.api.execution.ApiRequestBuilder;
import com.jaya.automation.api.execution.ApiRequestExecutor;
import com.jaya.automation.api.model.AuthSigninRequest;
import com.jaya.automation.bdd.context.BddWorld;
import com.jaya.automation.core.config.AutomationConfig;
import com.jaya.automation.core.config.ConfigLoader;
import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;
import io.cucumber.java.After;
import io.cucumber.java.AfterAll;
import io.cucumber.java.Scenario;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class ApiCleanupHooks {
    private static final AutomationLogger LOG = LoggerFactory.getLogger(ApiCleanupHooks.class);
    private static final Map<String, String> SIGNUP_USERS = new ConcurrentHashMap<>();
    private static final int DELETED_INDEX = 0;
    private static final int SKIPPED_INDEX = 1;
    private static final int FAILED_INDEX = 2;

    public static void trackSignupUser(String email, String password) {
        if (isBlank(email) || isBlank(password)) {
            return;
        }
        SIGNUP_USERS.put(email.trim(), password);
    }

    @After(value = "@api", order = 1)
    public void cleanupApiData(Scenario scenario) {
        if (scenario.isFailed()) {
            return;
        }
        cleanupUsers();
        cleanupRoles();
    }

    @AfterAll
    public static void cleanupSignupUsersAfterAllScenarios() {
        if (SIGNUP_USERS.isEmpty()) {
            return;
        }
        int trackedUsers = SIGNUP_USERS.size();
        int[] cleanupCounts = new int[3];
        AutomationConfig config = ConfigLoader.load();
        AuthApiClient authApiClient = new AuthApiClient(config);
        ApiRequestExecutor apiRequestExecutor = new ApiRequestExecutor(config, new ApiEndpointRegistry());
        for (Map.Entry<String, String> entry : SIGNUP_USERS.entrySet()) {
            SignupCleanupResult result = cleanupSingleSignupUser(
                    authApiClient,
                    apiRequestExecutor,
                    entry.getKey(),
                    entry.getValue()
            );
            incrementCleanupCount(cleanupCounts, result);
        }
        logCleanupSummary(trackedUsers, cleanupCounts);
        SIGNUP_USERS.clear();
    }

    private void cleanupUsers() {
        String userIds = BddWorld.aliasValue("cleanup.disposableUserIds").map(String::valueOf).orElse("");
        if (userIds.isBlank()) {
            return;
        }
        String adminToken = BddWorld.tokenProvider().token("admin");
        for (String userId : userIds.split(",")) {
            if (!userId.isBlank()) {
                BddWorld.apiRequestExecutor().execute(
                        ApiRequestBuilder.forEndpoint("admin.users.delete")
                                .pathParam("userId", userId.trim())
                                .build(),
                        adminToken
                );
            }
        }
    }

    private void cleanupRoles() {
        String roleIds = BddWorld.aliasValue("cleanup.disposableRoleIds").map(String::valueOf).orElse("");
        if (roleIds.isBlank()) {
            return;
        }
        String adminToken = BddWorld.tokenProvider().token("admin");
        for (String roleId : roleIds.split(",")) {
            if (!roleId.isBlank()) {
                BddWorld.apiRequestExecutor().execute(
                        ApiRequestBuilder.forEndpoint("roles.delete")
                                .pathParam("id", roleId.trim())
                                .build(),
                        adminToken
                );
            }
        }
    }

    private static SignupCleanupResult cleanupSingleSignupUser(
            AuthApiClient authApiClient,
            ApiRequestExecutor apiRequestExecutor,
            String email,
            String password
    ) {
        try {
            String jwtToken = resolveJwtToken(authApiClient, email, password);
            if (isBlank(jwtToken)) {
                return SignupCleanupResult.SKIPPED;
            }
            Object userId = resolveUserId(apiRequestExecutor, jwtToken);
            if (userId == null) {
                return SignupCleanupResult.SKIPPED;
            }
            deleteUser(apiRequestExecutor, jwtToken, userId);
            return SignupCleanupResult.DELETED;
        } catch (Exception exception) {
            LOG.warn("Failed to cleanup signup user '{}': {}", email, exception.getMessage());
            return SignupCleanupResult.FAILED;
        }
    }

    private static String resolveJwtToken(AuthApiClient authApiClient, String email, String password) {
        return authApiClient.signIn(new AuthSigninRequest(email, password)).getJwt();
    }

    private static Object resolveUserId(ApiRequestExecutor apiRequestExecutor, String jwtToken) {
        return apiRequestExecutor.execute(
                ApiRequestBuilder.forEndpoint("user.profile").build(),
                jwtToken
        ).jsonPathValue("id").orElse(null);
    }

    private static void deleteUser(ApiRequestExecutor apiRequestExecutor, String jwtToken, Object userId) {
        apiRequestExecutor.execute(
                ApiRequestBuilder.forEndpoint("user.delete")
                        .pathParam("id", String.valueOf(userId))
                        .build(),
                jwtToken
        );
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private static void incrementCleanupCount(int[] cleanupCounts, SignupCleanupResult result) {
        if (result == SignupCleanupResult.DELETED) {
            cleanupCounts[DELETED_INDEX]++;
            return;
        }
        if (result == SignupCleanupResult.SKIPPED) {
            cleanupCounts[SKIPPED_INDEX]++;
            return;
        }
        cleanupCounts[FAILED_INDEX]++;
    }

    private static void logCleanupSummary(int trackedUsers, int[] cleanupCounts) {
        LOG.info(
                "Signup cleanup summary: tracked={}, deleted={}, skipped={}, failed={}",
                trackedUsers,
                cleanupCounts[DELETED_INDEX],
                cleanupCounts[SKIPPED_INDEX],
                cleanupCounts[FAILED_INDEX]
        );
    }

    private enum SignupCleanupResult {
        DELETED,
        SKIPPED,
        FAILED
    }
}
