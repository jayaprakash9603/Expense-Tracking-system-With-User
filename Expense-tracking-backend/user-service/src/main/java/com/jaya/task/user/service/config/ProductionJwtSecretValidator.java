package com.jaya.task.user.service.config;

import com.jaya.common.security.JwtSecretConstants;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Confirms the shared static JWT secret meets minimum length.
 * Secret source of truth: {@link JwtSecretConstants#SECRET}.
 */
@Component
@Profile("!test")
public class ProductionJwtSecretValidator implements ApplicationRunner {

    private static final int MIN_SECRET_LENGTH = 32;

    @Override
    public void run(ApplicationArguments args) {
        String secret = JwtSecretConstants.SECRET;
        if (secret == null || secret.isBlank() || secret.length() < MIN_SECRET_LENGTH) {
            throw new IllegalStateException(
                    "JwtSecretConstants.SECRET must be at least " + MIN_SECRET_LENGTH + " characters");
        }
    }
}
