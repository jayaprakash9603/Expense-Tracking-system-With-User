package com.jaya.task.user.service.request;








public class MfaStatusResponse {

    


    private boolean mfaEnabled;

    


    private boolean twoFactorEnabled;

    


    private int remainingBackupCodes;

    


    private String mfaEnabledAt;

    



    private String activePriority;

    
    public MfaStatusResponse() {
    }

    public MfaStatusResponse(boolean mfaEnabled, boolean twoFactorEnabled,
            int remainingBackupCodes, String mfaEnabledAt) {
        this.mfaEnabled = mfaEnabled;
        this.twoFactorEnabled = twoFactorEnabled;
        this.remainingBackupCodes = remainingBackupCodes;
        this.mfaEnabledAt = mfaEnabledAt;

        
        if (mfaEnabled) {
            this.activePriority = "MFA";
        } else if (twoFactorEnabled) {
            this.activePriority = "2FA";
        } else {
            this.activePriority = "NONE";
        }
    }

    
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
