package com.jaya.common.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "common-library.internal-service-auth")
public class InternalServiceAuthProperties {

    private boolean enabled = true;
    private String token = "";

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String resolveToken() {
        if (token != null && !token.isBlank()) {
            return token;
        }
        String serviceToken = System.getenv("SERVICE_INTERNAL_TOKEN");
        if (serviceToken != null && !serviceToken.isBlank()) {
            return serviceToken;
        }
        String userServiceToken = System.getenv("USER_SERVICE_INTERNAL_TOKEN");
        return userServiceToken != null ? userServiceToken : "";
    }
}
