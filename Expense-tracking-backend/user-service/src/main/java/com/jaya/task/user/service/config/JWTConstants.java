package com.jaya.task.user.service.config;

import com.jaya.common.security.JwtSecretConstants;

public final class JWTConstants {

    public static final String JWT_HEADER = "Authorization";

    private JWTConstants() {
    }

    public static String getSecretKey() {
        return JwtSecretConstants.SECRET;
    }
}
