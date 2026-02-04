package com.jaya.task.user.service.request;

import java.util.List;

/**
 * =============================================================================
 * MfaSetupResponse - Response DTO for MFA setup initiation
 * =============================================================================
 * Contains all data needed for user to set up Google Authenticator.
 * 
 * SECURITY NOTES:
 * - 'secret' is plaintext for initial display only - never store unencrypted
 * - 'qrCodeDataUri' is a one-time display - should not be cached client-side
 * - This response should only be sent over HTTPS
 * =============================================================================
 */
public class MfaSetupResponse {

    /**
     * Plaintext TOTP secret for manual entry.
     * User can type this into their authenticator app if QR scan fails.
     */
    private String secret;

    /**
     * Base64-encoded PNG image as data URI.
     * Format: "data:image/png;base64,..."
     * User scans this QR code with Google Authenticator.
     */
    private String qrCodeDataUri;

    /**
     * otpauth:// URI for deep linking to authenticator apps.
     * Format:
     * "otpauth://totp/Issuer:email?secret=...&issuer=...&algorithm=SHA1&digits=6&period=30"
     */
    private String otpAuthUri;

    /**
     * Issuer name shown in authenticator app.
     */
    private String issuer;

    // Constructors
    public MfaSetupResponse() {
    }

    public MfaSetupResponse(String secret, String qrCodeDataUri, String otpAuthUri, String issuer) {
        this.secret = secret;
        this.qrCodeDataUri = qrCodeDataUri;
        this.otpAuthUri = otpAuthUri;
        this.issuer = issuer;
    }

    // Getters and Setters
    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public String getQrCodeDataUri() {
        return qrCodeDataUri;
    }

    public void setQrCodeDataUri(String qrCodeDataUri) {
        this.qrCodeDataUri = qrCodeDataUri;
    }

    public String getOtpAuthUri() {
        return otpAuthUri;
    }

    public void setOtpAuthUri(String otpAuthUri) {
        this.otpAuthUri = otpAuthUri;
    }

    public String getIssuer() {
        return issuer;
    }

    public void setIssuer(String issuer) {
        this.issuer = issuer;
    }
}
