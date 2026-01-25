package com.jaya.task.user.service.request;

/**
 * =============================================================================
 * MfaDisableRequest - Request DTO for disabling MFA
 * =============================================================================
 * Requires either password or valid OTP for security.
 * =============================================================================
 */
public class MfaDisableRequest {

    /**
     * User's password for verification.
     * Required if useOtp is false.
     */
    private String password;

    /**
     * Current 6-digit OTP from authenticator.
     * Required if useOtp is true.
     */
    private String otp;

    /**
     * Whether to use OTP for verification instead of password.
     * Useful for Google OAuth users who may not have a password.
     */
    private boolean useOtp;

    // Constructors
    public MfaDisableRequest() {
    }

    public MfaDisableRequest(String password, String otp, boolean useOtp) {
        this.password = password;
        this.otp = otp;
        this.useOtp = useOtp;
    }

    // Getters and Setters
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
