package com.jaya.task.user.service.request;

import java.util.List;








public class MfaEnableResponse {

    


    private String message;

    




    private List<String> backupCodes;

    


    private int backupCodeCount;

    


    private String enabledAt;

    
    public MfaEnableResponse() {
    }

    public MfaEnableResponse(String message, List<String> backupCodes, String enabledAt) {
        this.message = message;
        this.backupCodes = backupCodes;
        this.backupCodeCount = backupCodes != null ? backupCodes.size() : 0;
        this.enabledAt = enabledAt;
    }

    
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
