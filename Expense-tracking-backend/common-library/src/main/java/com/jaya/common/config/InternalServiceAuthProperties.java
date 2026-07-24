package com.jaya.common.config;

import com.jaya.common.security.InternalServiceTokenConstants;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "common-library.internal-service-auth")
public class InternalServiceAuthProperties {

    private boolean enabled = true;
    private String token = InternalServiceTokenConstants.TOKEN;

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
        if (userServiceToken != null && !userServiceToken.isBlank()) {
            return userServiceToken;
        }
        return InternalServiceTokenConstants.TOKEN;
    }
}
