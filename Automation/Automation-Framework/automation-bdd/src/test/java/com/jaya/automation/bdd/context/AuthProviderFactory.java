package com.jaya.automation.bdd.context;

import com.jaya.automation.core.config.AutomationConfig;
import com.jaya.automation.flows.auth.provider.MfaProvider;
import com.jaya.automation.flows.auth.provider.NoOpMfaProvider;
import com.jaya.automation.flows.auth.provider.NoOpOtpProvider;
import com.jaya.automation.flows.auth.provider.OtpProvider;
import com.jaya.automation.flows.auth.provider.StaticMfaProvider;
import com.jaya.automation.flows.auth.provider.StaticOtpProvider;
import com.jaya.automation.flows.auth.provider.TotpMfaProvider;

import java.util.Locale;

public final class AuthProviderFactory {
    private AuthProviderFactory() {
    }

    public static OtpProvider otpProvider(AutomationConfig config) {
        String providerType = normalize(config.otpProvider());
        if ("STATIC".equals(providerType)) {
            return new StaticOtpProvider(read("OTP_STATIC_CODE"));
        }
        return new NoOpOtpProvider();
    }

    public static MfaProvider mfaProvider(AutomationConfig config) {
        String providerType = normalize(config.mfaProvider());
        if ("STATIC".equals(providerType)) {
            return new StaticMfaProvider(read("MFA_STATIC_CODE"));
        }
        if ("TOTP".equals(providerType)) {
            return new TotpMfaProvider(read("MFA_TOTP_SECRET"));
        }
        return new NoOpMfaProvider();
    }

    private static String read(String key) {
        String systemValue = System.getProperty(key);
        if (systemValue != null && !systemValue.isBlank()) {
            return systemValue.trim();
        }
        String envValue = System.getenv(key);
        return envValue == null ? "" : envValue.trim();
    }

    private static String normalize(String value) {
        return value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
    }
}
