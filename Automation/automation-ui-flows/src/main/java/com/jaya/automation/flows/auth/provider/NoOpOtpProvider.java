package com.jaya.automation.flows.auth.provider;

import java.util.Optional;

public final class NoOpOtpProvider implements OtpProvider {
    @Override
    public Optional<String> resolveLoginOtp(String username) {
        return Optional.empty();
    }
}
