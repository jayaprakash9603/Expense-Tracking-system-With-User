package com.jaya.common.security;

import com.jaya.common.config.InternalServiceAuthProperties;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;

@Component
public class InternalServiceAuthHeaders {

    private final InternalServiceAuthProperties properties;

    public InternalServiceAuthHeaders(InternalServiceAuthProperties properties) {
        this.properties = properties;
    }

    public void applyForInternalPath(HttpHeaders headers, String pathOrUrl) {
        if (pathOrUrl == null || !InternalServiceAuthSupport.isInternalPath(pathOrUrl)) {
            return;
        }
        String token = properties.resolveToken();
        if (!token.isBlank()) {
            headers.set(InternalServiceAuthSupport.SERVICE_TOKEN_HEADER, token);
        }
    }
}
