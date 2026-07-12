package com.jaya.automation.bdd.hooks;

import com.jaya.automation.api.client.AuthApiClient;
import com.jaya.automation.api.config.ApiSpecifications;
import com.jaya.automation.api.execution.ApiRequestBuilder;
import com.jaya.automation.api.model.AuthSigninRequest;
import com.jaya.automation.bdd.context.BddWorld;
import com.jaya.automation.core.config.AutomationConfig;
import com.jaya.automation.core.config.ConfigLoader;
import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;
import io.cucumber.java.After;
import io.cucumber.java.AfterAll;
import io.cucumber.java.Scenario;
import io.restassured.specification.RequestSpecification;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import static io.restassured.RestAssured.given;

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
        RequestSpecification requestSpec = new ApiSpecifications(config).requestSpec();
        for (Map.Entry<String, String> entry : SIGNUP_USERS.entrySet()) {
            SignupCleanupResult result = cleanupSingleSignupUser(
                    authApiClient,
                    requestSpec,
                    entry.getKey(),
                    entry.getValue()
            );
            incrementCleanupCount(cleanupCounts, result);
        }
        logCleanupSummary(trackedUsers, cleanupCounts);
        SIGNUP_USERS.clear();
    }

    private void cleanupUsers() {
        try {
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
        } catch (Exception exception) {
            LOG.debug("API cleanup skipped for disposable users: {}", exception.getMessage());
        }
    }

    private void cleanupRoles() {
        try {
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
        } catch (Exception exception) {
            LOG.debug("API cleanup skipped for disposable roles: {}", exception.getMessage());
        }
    }

    private static SignupCleanupResult cleanupSingleSignupUser(
            AuthApiClient authApiClient,
            RequestSpecification requestSpec,
            String email,
            String password
    ) {
        try {
            String jwtToken = resolveJwtToken(authApiClient, email, password);
            if (isBlank(jwtToken)) {
                return SignupCleanupResult.SKIPPED;
            }
            Object userId = resolveUserId(requestSpec, jwtToken);
            if (userId == null) {
                return SignupCleanupResult.SKIPPED;
            }
            deleteUser(requestSpec, jwtToken, userId);
            return SignupCleanupResult.DELETED;
        } catch (Exception exception) {
            LOG.warn("Failed to cleanup signup user '{}': {}", email, exception.getMessage());
            return SignupCleanupResult.FAILED;
        }
    }

    private static String resolveJwtToken(AuthApiClient authApiClient, String email, String password) {
        return authApiClient.signIn(new AuthSigninRequest(email, password)).getJwt();
    }

    private static Object resolveUserId(RequestSpecification requestSpec, String jwtToken) {
        return given()
                .spec(requestSpec)
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .get("/api/user/profile")
                .jsonPath()
                .get("id");
    }

    private static void deleteUser(RequestSpecification requestSpec, String jwtToken, Object userId) {
        given()
                .spec(requestSpec)
                .header("Authorization", "Bearer " + jwtToken)
                .when()
                .delete("/api/user/" + userId);
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
