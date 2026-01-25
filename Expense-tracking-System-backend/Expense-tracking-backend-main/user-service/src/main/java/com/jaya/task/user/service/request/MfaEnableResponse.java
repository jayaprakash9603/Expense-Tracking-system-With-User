package com.jaya.task.user.service.request;

import java.util.List;

/**
 * =============================================================================
 * MfaEnableResponse - Response DTO after successfully enabling MFA
 * =============================================================================
 * Contains backup codes that user MUST save - shown only once.
 * =============================================================================
 */
public class MfaEnableResponse {

    /**
     * Success message confirming MFA is enabled.
     */
    private String message;

    /**
     * Backup codes for recovery access.
     * Format: ["XXXX-XXXX", "XXXX-XXXX", ...] (10 codes)
     * CRITICAL: These are shown ONLY ONCE - user must save them.
     */
    private List<String> backupCodes;

    /**
     * Number of backup codes provided.
     */
    private int backupCodeCount;

    /**
     * Timestamp when MFA was enabled.
     */
    private String enabledAt;

    // Constructors
    public MfaEnableResponse() {
    }

    public MfaEnableResponse(String message, List<String> backupCodes, String enabledAt) {
        this.message = message;
        this.backupCodes = backupCodes;
        this.backupCodeCount = backupCodes != null ? backupCodes.size() : 0;
        this.enabledAt = enabledAt;
    }

    // Getters and Setters
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<String> getBackupCodes() {
        return backupCodes;
    }

    public void setBackupCodes(List<String> backupCodes) {
        this.backupCodes = backupCodes;
        this.backupCodeCount = backupCodes != null ? backupCodes.size() : 0;
    }

    public int getBackupCodeCount() {
        return backupCodeCount;
    }

    public void setBackupCodeCount(int backupCodeCount) {
        this.backupCodeCount = backupCodeCount;
    }

    public String getEnabledAt() {
        return enabledAt;
    }

    public void setEnabledAt(String enabledAt) {
        this.enabledAt = enabledAt;
    }
}
