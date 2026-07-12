package com.jaya.automation.api.client;

import com.jaya.automation.api.config.ApiSpecifications;
import com.jaya.automation.core.config.AutomationConfig;
import io.restassured.specification.RequestSpecification;

abstract class AuthorizedApiClient {
    protected final RequestSpecification requestSpecification;

    protected AuthorizedApiClient(AutomationConfig automationConfig) {
        this.requestSpecification = new ApiSpecifications(automationConfig).requestSpec();
    }

    protected String bearer(String jwtToken) {
        if (jwtToken.startsWith("Bearer ")) {
            return jwtToken;
        }
        return "Bearer " + jwtToken;
    }
}
