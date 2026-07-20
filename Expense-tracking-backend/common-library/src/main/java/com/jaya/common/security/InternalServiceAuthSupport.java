package com.jaya.common.security;

import java.util.regex.Pattern;

public final class InternalServiceAuthSupport {

    public static final String SERVICE_TOKEN_HEADER = "X-Service-Token";
    public static final String ROLE_SERVICE = "ROLE_SERVICE";
    private static final Pattern INTERNAL_PATH = Pattern.compile("(^|/)internal(/|$)");

    private InternalServiceAuthSupport() {
    }

    public static boolean isInternalPath(String path) {
        return path != null && INTERNAL_PATH.matcher(path).find();
    }
}
