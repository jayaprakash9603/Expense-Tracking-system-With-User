package com.jaya.task.user.service.request;

/**
 * =============================================================================
 * MfaEnableRequest - Request DTO for enabling MFA
 * =============================================================================
 * User must verify first OTP to prove they've set up authenticator correctly.
 * =============================================================================
 */
public class MfaEnableRequest {

    /**
     * The temporary secret from setup phase.
     * This gets permanently stored (encrypted) after successful verification.
     */
    private String tempSecret;

    /**
     * 6-digit OTP code from Google Authenticator.
     * Verifies user has correctly set up the authenticator.
     */
    private String otp;

    // Constructors
    public MfaEnableRequest() {
    }

    public MfaEnableRequest(String tempSecret, String otp) {
        this.tempSecret = tempSecret;
        this.otp = otp;
    }

    // Getters and Setters
    public String getTempSecret() {
        return tempSecret;
    }

    public void setTempSecret(String tempSecret) {
        this.tempSecret = tempSecret;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }
}
