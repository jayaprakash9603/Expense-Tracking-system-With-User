package com.jaya.automation.flows.auth.provider;

import java.util.Optional;

public final class StaticMfaProvider implements MfaProvider {
    private final String mfaCode;

    public StaticMfaProvider(String mfaCode) {
        this.mfaCode = mfaCode;
    }

    @Override
    public Optional<String> resolveMfaCode(String username, String mfaToken, boolean backupCode) {
        if (mfaCode == null || mfaCode.isBlank()) {
            return Optional.empty();
        }
        return Optional.of(mfaCode);
    }
}
