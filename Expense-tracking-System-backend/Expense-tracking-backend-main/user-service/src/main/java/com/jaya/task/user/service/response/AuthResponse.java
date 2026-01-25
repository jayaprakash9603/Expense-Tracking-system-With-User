package com.jaya.task.user.service.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * =============================================================================
 * AuthResponse - Authentication Response DTO
 * =============================================================================
 * 
 * Unified response for all authentication endpoints.
 * Supports three authentication flows:
 * 
 * 1. STANDARD LOGIN:
 * - status: true
 * - jwt: valid token
 * - twoFactorRequired: false
 * - mfaRequired: false
 * 
 * 2. EMAIL 2FA REQUIRED:
 * - status: true
 * - jwt: null
 * - message: "OTP_REQUIRED"
 * - twoFactorRequired: true
 * - mfaRequired: false
 * 
 * 3. MFA (GOOGLE AUTHENTICATOR) REQUIRED:
 * - status: true
 * - jwt: null
 * - message: "MFA_REQUIRED"
 * - mfaRequired: true
 * - mfaToken: temporary token for MFA verification
 * - twoFactorRequired: false
 * 
 * PRIORITY: MFA takes precedence over email 2FA when both are enabled.
 * =============================================================================
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {

    /**
     * JWT token issued on successful authentication.
     * Null when 2FA/MFA verification is pending.
     */
    private String jwt;

    /**
     * Response message indicating status or required action.
     * Values: "Login Success", "OTP_REQUIRED", "MFA_REQUIRED", error messages
     */
    private String message;

    /**
     * Overall request status.
     * true = request processed (even if auth incomplete due to 2FA/MFA)
     * false = error occurred
     */
    private boolean status;

    /**
     * When true, client must complete EMAIL OTP verification.
     * Send OTP to /auth/verify-login-otp endpoint.
     */
    private Boolean twoFactorRequired;

    /**
     * When true, client must complete TOTP/MFA verification.
     * Use mfaToken with /auth/mfa/verify endpoint.
     * MFA takes priority over email 2FA when both enabled.
     */
    private Boolean mfaRequired;

    /**
     * Temporary token for MFA verification (5 min expiry).
     * Only set when mfaRequired = true.
     * Send this with OTP to /auth/mfa/verify endpoint.
     */
    private String mfaToken;
}
