package com.jaya.automation.flows.auth.provider;

import java.util.Optional;

public interface MfaProvider {
    Optional<String> resolveMfaCode(String username, String mfaToken, boolean backupCode);
}
