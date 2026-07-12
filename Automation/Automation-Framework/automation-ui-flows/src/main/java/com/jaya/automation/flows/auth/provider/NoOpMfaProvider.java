package com.jaya.automation.flows.auth.provider;

import java.util.Optional;

public final class NoOpMfaProvider implements MfaProvider {
    @Override
    public Optional<String> resolveMfaCode(String username, String mfaToken, boolean backupCode) {
        return Optional.empty();
    }
}
