package com.jaya.task.user.service.request;








public class MfaEnableRequest {

    



    private String tempSecret;

    



    private String otp;

    
    public MfaEnableRequest() {
    }

    public MfaEnableRequest(String tempSecret, String otp) {
        this.tempSecret = tempSecret;
        this.otp = otp;
    }

    
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
