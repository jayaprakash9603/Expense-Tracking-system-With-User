package com.jaya.task.user.service.config;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

import org.junit.jupiter.api.Test;
import org.springframework.boot.DefaultApplicationArguments;

class ProductionJwtSecretValidatorTest {

    @Test
    void acceptsSharedStaticSecret() {
        ProductionJwtSecretValidator validator = new ProductionJwtSecretValidator();

        assertDoesNotThrow(() -> validator.run(new DefaultApplicationArguments(new String[0])));
    }
}
