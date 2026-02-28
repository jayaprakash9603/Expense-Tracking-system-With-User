package com.jaya.task.user.service.request;

import com.fasterxml.jackson.annotation.JsonProperty;








public class MfaVerifyRequest {

    




    private String mfaToken;

    


    private String otp;

    



    @JsonProperty("isBackupCode")
    private boolean backupCode;

    
    public MfaVerifyRequest() {
    }

    public MfaVerifyRequest(String mfaToken, String otp, boolean backupCode) {
        this.mfaToken = mfaToken;
        this.otp = otp;
        this.backupCode = backupCode;
    }

    
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
