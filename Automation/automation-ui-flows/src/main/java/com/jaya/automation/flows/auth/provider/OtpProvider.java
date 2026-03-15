package com.jaya.automation.flows.auth.provider;

import java.util.Optional;

public interface OtpProvider {
    Optional<String> resolveLoginOtp(String username);
}
