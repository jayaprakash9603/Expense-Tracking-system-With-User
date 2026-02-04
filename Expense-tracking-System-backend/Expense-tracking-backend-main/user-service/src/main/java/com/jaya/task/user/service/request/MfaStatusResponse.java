package com.jaya.task.user.service.request;

/**
 * =============================================================================
 * MfaStatusResponse - Response DTO for MFA status queries
 * =============================================================================
 * Provides current MFA configuration status for user.
 * =============================================================================
 */
public class MfaStatusResponse {

    /**
     * Whether MFA (Google Authenticator) is enabled.
     */
    private boolean mfaEnabled;

    /**
     * Whether email-based 2FA is enabled.
     */
    private boolean twoFactorEnabled;

    /**
     * Number of remaining backup codes (if MFA enabled).
     */
    private int remainingBackupCodes;

    /**
     * Timestamp when MFA was enabled (if enabled).
     */
    private String mfaEnabledAt;

    /**
     * Indicates which method takes priority during login.
     * "MFA" if mfaEnabled, "2FA" if only twoFactorEnabled, "NONE" if neither.
     */
    private String activePriority;

    // Constructors
    public MfaStatusResponse() {
    }

    public MfaStatusResponse(boolean mfaEnabled, boolean twoFactorEnabled,
            int remainingBackupCodes, String mfaEnabledAt) {
        this.mfaEnabled = mfaEnabled;
        this.twoFactorEnabled = twoFactorEnabled;
        this.remainingBackupCodes = remainingBackupCodes;
        this.mfaEnabledAt = mfaEnabledAt;

        // MFA takes priority over email 2FA
        if (mfaEnabled) {
            this.activePriority = "MFA";
        } else if (twoFactorEnabled) {
            this.activePriority = "2FA";
        } else {
            this.activePriority = "NONE";
        }
    }

    // Getters and Setters
    public boolean isMfaEnabled() {
        return mfaEnabled;
    }

    public void setMfaEnabled(boolean mfaEnabled) {
        this.mfaEnabled = mfaEnabled;
        updateActivePriority();
    }

    public boolean isTwoFactorEnabled() {
        return twoFactorEnabled;
    }

    public void setTwoFactorEnabled(boolean twoFactorEnabled) {
        this.twoFactorEnabled = twoFactorEnabled;
        updateActivePriority();
    }

    public int getRemainingBackupCodes() {
        return remainingBackupCodes;
    }

    public void setRemainingBackupCodes(int remainingBackupCodes) {
        this.remainingBackupCodes = remainingBackupCodes;
    }

    public String getMfaEnabledAt() {
        return mfaEnabledAt;
    }

    public void setMfaEnabledAt(String mfaEnabledAt) {
        this.mfaEnabledAt = mfaEnabledAt;
    }

    public String getActivePriority() {
        return activePriority;
    }

    public void setActivePriority(String activePriority) {
        this.activePriority = activePriority;
    }

    private void updateActivePriority() {
        if (this.mfaEnabled) {
            this.activePriority = "MFA";
        } else if (this.twoFactorEnabled) {
            this.activePriority = "2FA";
        } else {
            this.activePriority = "NONE";
        }
    }
}
