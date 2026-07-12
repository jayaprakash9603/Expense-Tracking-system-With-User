package com.jaya.task.user.service.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
@Profile("!test")
public class ProductionJwtSecretValidator implements ApplicationRunner {

    private static final String WEAK_DEFAULT = "your-secret-key-for-jwt-token-generation-min-256-bits";

    private static final int MIN_SECRET_LENGTH = 32;

    private final Environment environment;

    public ProductionJwtSecretValidator(Environment environment) {
        this.environment = environment;
    }

    @Override
    public void run(ApplicationArguments args) {
        boolean strictJwt = Arrays.stream(environment.getActiveProfiles())
                .anyMatch(p -> {
                    String pl = p.toLowerCase();
                    return pl.equals("prod")
                            || pl.equals("production")
                            || pl.equals("monolithic")
                            || pl.equals("staging");
                });
        if (!strictJwt) {
            return;
        }
        String secret = System.getenv("JWT_SECRET");
        if (secret == null || secret.isBlank()) {
            secret = environment.getProperty("JWT_SECRET", "");
        }
        if (secret == null || secret.isBlank() || WEAK_DEFAULT.equals(secret) || secret.length() < MIN_SECRET_LENGTH) {
            throw new IllegalStateException(
                    "JWT_SECRET must be set to a strong value (at least "
                            + MIN_SECRET_LENGTH
                            + " characters, not the default) when profile prod, production, monolithic, or staging is active");
        }
    }
}
