package com.jaya.automation.api.util;

public final class TokenManager {
    private final TokenProvider tokenProvider;

    public TokenManager(TokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    public String userToken() {
        return tokenProvider.token("user");
    }

    public String adminToken() {
        return tokenProvider.token("admin");
    }

    public String invalidToken() {
        return tokenProvider.token("invalid");
    }

    public String expiredToken() {
        return tokenProvider.token("expired");
    }

    public String token(String alias) {
        return tokenProvider.token(alias);
    }
}
