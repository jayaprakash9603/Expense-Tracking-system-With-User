package com.jaya.common.security;

/**
 * Single static token for internal service-to-service calls (X-Service-Token).
 * Used when SERVICE_INTERNAL_TOKEN is not provided via environment.
 */
public final class InternalServiceTokenConstants {

    public static final String TOKEN = "expensio-static-internal-service-token-v1";

    private InternalServiceTokenConstants() {
    }
}
