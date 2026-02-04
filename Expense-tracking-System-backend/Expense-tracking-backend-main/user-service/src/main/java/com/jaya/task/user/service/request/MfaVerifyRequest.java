package com.jaya.task.user.service.request;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * =============================================================================
 * MfaVerifyRequest - Request DTO for MFA verification during login
 * =============================================================================
 * Used when user has MFA enabled and needs to provide TOTP after password auth.
 * =============================================================================
 */
public class MfaVerifyRequest {

    /**
     * Temporary token issued after password authentication.
     * This token is short-lived (5 minutes) and only valid for MFA verification.
     * Format: JWT with claim "mfa_pending" = true
     */
    private String mfaToken;

    /**
     * 6-digit OTP code from Google Authenticator.
     */
    private String otp;

    /**
     * Whether this is a backup code instead of TOTP.
     * Backup codes are format: XXXX-XXXX (alphanumeric)
     */
    @JsonProperty("isBackupCode")
    private boolean backupCode;

    // Constructors
    public MfaVerifyRequest() {
    }

    public MfaVerifyRequest(String mfaToken, String otp, boolean backupCode) {
        this.mfaToken = mfaToken;
        this.otp = otp;
        this.backupCode = backupCode;
    }

    // Getters and Setters
    public String getMfaToken() {
        return mfaToken;
    }

    public void setMfaToken(String mfaToken) {
        this.mfaToken = mfaToken;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public boolean isBackupCode() {
        return backupCode;
    }

    public void setBackupCode(boolean backupCode) {
        this.backupCode = backupCode;
    }
}
