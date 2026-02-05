package com.jaya.task.user.service.config;

public class JWTConstants {

    /**
     * JWT Secret Key - MUST be set via environment variable JWT_SECRET_KEY in
     * production.
     * Default value is for local development only and should NEVER be used in
     * production.
     */
    public static final String SECRET_KEY = System.getenv("JWT_SECRET_KEY") != null
            ? System.getenv("JWT_SECRET_KEY")
            : "dev-only-secret-key-change-in-production-min-32-chars";

    public static final String JWT_HEADER = "Authorization";
}
