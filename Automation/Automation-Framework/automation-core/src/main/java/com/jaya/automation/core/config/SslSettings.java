package com.jaya.automation.core.config;

public record SslSettings(
        boolean skipCertificateValidation,
        String truststorePath,
        String truststorePassword
) {
    public static SslSettings defaults() {
        return new SslSettings(false, "", "");
    }

    public boolean hasTruststore() {
        return truststorePath != null && !truststorePath.isBlank();
    }
}
