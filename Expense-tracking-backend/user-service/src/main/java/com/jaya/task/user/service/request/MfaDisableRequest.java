package com.jaya.task.user.service.request;








public class MfaDisableRequest {

    



    private String password;

    



    private String otp;

    



    private boolean useOtp;

    
    public MfaDisableRequest() {
    }

    public MfaDisableRequest(String password, String otp, boolean useOtp) {
        this.password = password;
        this.otp = otp;
        this.useOtp = useOtp;
    }

    
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public boolean isUseOtp() {
        return useOtp;
    }

    public void setUseOtp(boolean useOtp) {
        this.useOtp = useOtp;
    }
}
