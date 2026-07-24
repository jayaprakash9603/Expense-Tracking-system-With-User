package com.jaya.common.security;

/**
 * Single static HMAC secret for JWT sign and verify across all services.
 * This is the only place the secret is defined.
 */
public final class JwtSecretConstants {

    public static final String SECRET =
            "expensio-static-jwt-hmac-secret-key-min-32-chars-v1";

    public static final long EXPIRATION_MS = 86400000L;

    private JwtSecretConstants() {
    }
}
