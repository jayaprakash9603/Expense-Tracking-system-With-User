package com.jaya.ratelimit;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration properties for rate limiting.
 */
@Component
@ConfigurationProperties(prefix = "gateway.rate-limit")
public class RateLimitProperties {
    /** Enable/disable the rate limiter */
    private boolean enabled = true;
    /** Max requests allowed in the window */
    private int requests = 100;
    /** Window size in seconds */
    private int windowSeconds = 60;

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public int getRequests() {
        return requests;
    }

    public void setRequests(int requests) {
        this.requests = requests;
    }

    public int getWindowSeconds() {
        return windowSeconds;
    }

    public void setWindowSeconds(int windowSeconds) {
        this.windowSeconds = windowSeconds;
    }
}
