package com.jaya.automation.app;

import com.jaya.automation.core.config.AppBootstrapSettings;
import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;

public final class HealthCheckOrchestrator {
    private static final AutomationLogger LOG = LoggerFactory.getLogger(HealthCheckOrchestrator.class);
    private final HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();

    public void waitUntilReady(AppBootstrapSettings settings) {
        if (!settings.hasReadyUrl()) {
            LOG.info("APP_READY_URL is not set. Skipping readiness checks");
            return;
        }
        LOG.info("Waiting for readiness endpoint: {}", settings.readyUrl());
        Instant deadline = Instant.now().plus(settings.readyTimeout());
        int attempt = 0;
        while (Instant.now().isBefore(deadline)) {
            attempt++;
            if (isReachable(settings.readyUrl())) {
                LOG.info("Readiness check passed on attempt {}", attempt);
                return;
            }
            LOG.debug("Readiness check attempt {} failed", attempt);
            sleep();
        }
        throw new IllegalStateException("Application is not ready: " + settings.readyUrl());
    }

    private boolean isReachable(String url) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(5))
                    .GET()
                    .build();
            HttpResponse<Void> response = httpClient.send(request, HttpResponse.BodyHandlers.discarding());
            return response.statusCode() > 0 && response.statusCode() < 500;
        } catch (Exception ex) {
            return false;
        }
    }

    private void sleep() {
        try {
            Thread.sleep(2000L);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Health check interrupted", ex);
        }
    }
}
