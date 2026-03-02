package com.jaya.task.user.service.config;

public class JWTConstants {

    





    public static final String SECRET_KEY = System.getenv("JWT_SECRET") != null
            ? System.getenv("JWT_SECRET")
            : "your-secret-key-for-jwt-token-generation-min-256-bits";

    public static final String JWT_HEADER = "Authorization";
}
