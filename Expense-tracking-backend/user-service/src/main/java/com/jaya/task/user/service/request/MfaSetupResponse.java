package com.jaya.task.user.service.request;

import java.util.List;













public class MfaSetupResponse {

    



    private String secret;

    




    private String qrCodeDataUri;

    




    private String otpAuthUri;

    


    private String issuer;

    
    public MfaSetupResponse() {
    }

    public MfaSetupResponse(String secret, String qrCodeDataUri, String otpAuthUri, String issuer) {
        this.secret = secret;
        this.qrCodeDataUri = qrCodeDataUri;
        this.otpAuthUri = otpAuthUri;
        this.issuer = issuer;
    }

    
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
