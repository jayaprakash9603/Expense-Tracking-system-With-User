package com.jaya.task.user.service.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

/**
 * Configuration for the five-day account-deletion saga. All defaults are
 * safe for local/dev; production overrides live in application.yaml.
 */
@Data
@Component
@ConfigurationProperties(prefix = "account-deletion")
public class AccountDeletionProperties {

    /** Master feature flag. When false, the new APIs 404 and the scheduler is idle. */
    private boolean sagaEnabled = true;

    /** Grace period between deletion request and purge start. Plan: 5 days. */
    private Duration gracePeriod = Duration.ofDays(5);

    /** Scheduler tick interval. */
    private Duration schedulerInterval = Duration.ofMinutes(1);

    /** Max delivery attempts per participant before the step is FAILED. */
    private int maxAttempts = 5;

    /** Base delay for exponential backoff between retries. */
    private Duration retryBaseDelay = Duration.ofMinutes(2);

    /** Cap for a single retry delay. */
    private Duration retryMaxDelay = Duration.ofHours(6);

    /** Participants that must confirm SUCCEEDED before the user identity is deleted. */
    private List<String> participants = new ArrayList<>(List.of(
            "user-service",
            "expense-service",
            "budget-service",
            "bill-service",
            "event-service",
            "category-service",
            "payment-method-service",
            "friendship-service",
            "notification-service",
            "search-service",
            "story-service",
            "chat-service",
            "audit-service"
    ));
}
