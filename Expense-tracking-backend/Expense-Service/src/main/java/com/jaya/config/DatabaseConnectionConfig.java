package com.jaya.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.retry.backoff.FixedBackOffPolicy;
import org.springframework.retry.policy.SimpleRetryPolicy;
import org.springframework.retry.support.RetryTemplate;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

@Slf4j
@Configuration
@EnableRetry
public class DatabaseConnectionConfig {

    @Bean
    public RetryTemplate retryTemplate() {
        RetryTemplate retryTemplate = new RetryTemplate();

        SimpleRetryPolicy retryPolicy = new SimpleRetryPolicy();
        retryPolicy.setMaxAttempts(10);
        retryTemplate.setRetryPolicy(retryPolicy);

        FixedBackOffPolicy backOffPolicy = new FixedBackOffPolicy();
        backOffPolicy.setBackOffPeriod(3000L);
        retryTemplate.setBackOffPolicy(backOffPolicy);

        return retryTemplate;
    }

    @Bean
    @ConditionalOnProperty(name = "spring.datasource.url")
    public DatabaseConnectionValidator databaseConnectionValidator(DataSource dataSource) {
        return new DatabaseConnectionValidator(dataSource);
    }

    @Slf4j
    public static class DatabaseConnectionValidator {
        private final DataSource dataSource;

        public DatabaseConnectionValidator(DataSource dataSource) {
            this.dataSource = dataSource;
            validateConnection();
        }

        private void validateConnection() {
            int maxRetries = 10;
            int retryCount = 0;
            long waitTime = 3000;

            while (retryCount < maxRetries) {
                try {
                    log.info("Attempting to connect to database... (Attempt {}/{})", retryCount + 1, maxRetries);

                    try (Connection connection = dataSource.getConnection()) {
                        if (connection.isValid(5)) {
                            log.info("✅ Successfully connected to database!");
                            return;
                        }
                    }
                } catch (SQLException e) {
                    retryCount++;
                    log.warn("⚠️ Failed to connect to database (Attempt {}/{}): {}",
                            retryCount, maxRetries, e.getMessage());

                    if (retryCount < maxRetries) {
                        try {
                            log.info("Waiting {} seconds before retry...", waitTime / 1000);
                            Thread.sleep(waitTime);
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            throw new RuntimeException("Database connection interrupted", ie);
                        }
                    } else {
                        log.error("❌ Failed to connect to database after {} attempts", maxRetries);
                        throw new RuntimeException("Could not connect to database after " + maxRetries + " attempts",
                                e);
                    }
                }
            }
        }
    }
}
