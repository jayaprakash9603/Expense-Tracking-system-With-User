package com.jaya.automation.bdd.handler;

import com.jaya.automation.api.execution.ApiExecutionResult;
import com.jaya.automation.api.execution.ApiRequest;
import com.jaya.automation.api.model.AuthSigninRequest;
import com.jaya.automation.api.model.AuthSigninResponse;
import com.jaya.automation.bdd.context.BddWorld;
import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Handler for authentication flows. Wraps sign-in, token management,
 * and session validation with retry and context enrichment.
 */
@Component
public class AuthHandler extends BaseApiHandler {
    private static final AutomationLogger LOG = LoggerFactory.getLogger(AuthHandler.class);

    /**
     * Authenticate using the contract-driven API execution chain.
     * Stores JWT token in BddWorld and returns the execution result.
     */
    public ApiExecutionResult authenticateViaApi(String email, String password) {
        AuthSigninRequest payload = new AuthSigninRequest(email, password);
        ApiRequest request = builder("auth.signin").body(payload).build();
        ApiExecutionResult result = execute(request);
        assertStatusIn(result, 200, 201);

        result.jsonPathValue("jwt").ifPresent(token -> {
            String jwt = token.toString();
            BddWorld.setJwtToken(jwt);
            BddWorld.putAliasValue("token.default", jwt);
            LOG.info("Authenticated user: {}", email);
        });

        return result;
    }

    /**
     * Authenticate using the typed AuthApiClient (legacy path).
     * Returns the typed response and stores JWT in BddWorld.
     */
    public AuthSigninResponse authenticate(String email, String password) {
        AuthSigninRequest payload = new AuthSigninRequest(email, password);
        AuthSigninResponse response = BddWorld.authApiClient().signIn(payload);
        if (response.getJwt() != null) {
            BddWorld.setJwtToken(response.getJwt());
            BddWorld.putAliasValue("token.default", response.getJwt());
        }
        return response;
    }

    /**
     * Verify the current JWT token is valid by fetching user profile.
     */
    public boolean isSessionValid() {
        try {
            ApiRequest request = builder("user.profile").build();
            ApiExecutionResult result = execute(request);
            return result.statusCode() == 200;
        } catch (Exception e) {
            LOG.warn("Session validation failed: {}", e.getMessage());
            return false;
        }
    }
}
