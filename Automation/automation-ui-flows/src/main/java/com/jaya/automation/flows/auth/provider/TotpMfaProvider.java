package com.jaya.automation.flows.auth.provider;

import com.jaya.automation.flows.auth.util.TotpGenerator;

import java.util.Optional;

public final class TotpMfaProvider implements MfaProvider {
    private final String sharedSecret;

    public TotpMfaProvider(String sharedSecret) {
        this.sharedSecret = sharedSecret;
    }

    @Override
    public Optional<String> resolveMfaCode(String username, String mfaToken, boolean backupCode) {
        if (backupCode || sharedSecret == null || sharedSecret.isBlank()) {
            return Optional.empty();
        }
        return Optional.of(TotpGenerator.generateCode(sharedSecret));
    }
}
