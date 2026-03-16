package com.jaya.automation.flows.auth.provider;

import java.util.Optional;

public final class StaticOtpProvider implements OtpProvider {
    private final String otpCode;

    public StaticOtpProvider(String otpCode) {
        this.otpCode = otpCode;
    }

    @Override
    public Optional<String> resolveLoginOtp(String username) {
        if (otpCode == null || otpCode.isBlank()) {
            return Optional.empty();
        }
        return Optional.of(otpCode);
    }
}
