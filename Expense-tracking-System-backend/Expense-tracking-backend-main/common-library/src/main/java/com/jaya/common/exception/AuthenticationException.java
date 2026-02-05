package com.jaya.common.exception;

import com.jaya.common.error.ErrorCode;





public class AuthenticationException extends BaseException {

    private static final long serialVersionUID = 1L;

    public AuthenticationException(ErrorCode errorCode) {
        super(errorCode);
    }

    public AuthenticationException(ErrorCode errorCode, String details) {
        super(errorCode, details);
    }

    public AuthenticationException(ErrorCode errorCode, Throwable cause) {
        super(errorCode, cause);
    }

    
    public static AuthenticationException tokenExpired() {
        return new AuthenticationException(ErrorCode.AUTH_TOKEN_EXPIRED);
    }

    public static AuthenticationException invalidToken() {
        return new AuthenticationException(ErrorCode.AUTH_TOKEN_INVALID);
    }

    public static AuthenticationException invalidSignature() {
        return new AuthenticationException(ErrorCode.AUTH_TOKEN_SIGNATURE_INVALID);
    }

    public static AuthenticationException tokenMissing() {
        return new AuthenticationException(ErrorCode.AUTH_TOKEN_MISSING);
    }

    public static AuthenticationException invalidCredentials() {
        return new AuthenticationException(ErrorCode.AUTH_CREDENTIALS_INVALID);
    }

    public static AuthenticationException accountLocked() {
        return new AuthenticationException(ErrorCode.AUTH_ACCOUNT_LOCKED);
    }

    public static AuthenticationException accountDisabled() {
        return new AuthenticationException(ErrorCode.AUTH_ACCOUNT_DISABLED);
    }

    public static AuthenticationException sessionExpired() {
        return new AuthenticationException(ErrorCode.AUTH_SESSION_EXPIRED);
    }
}
