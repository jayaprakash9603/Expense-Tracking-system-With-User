package com.jaya.automation.bdd.context;

import com.jaya.automation.core.config.AutomationConfig;
import org.testng.SkipException;

import java.nio.file.Files;
import java.nio.file.Path;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public final class DependencyGuard {
    private final HttpClient httpClient;

    public DependencyGuard() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(3))
                .build();
    }

    public void requireReachable(String endpointName, String url) {
        if (isReachable(url)) {
            return;
        }
        String message = endpointName + " is not reachable at " + url + ". Start target service and retry.";
        throw new SkipException(message);
    }

    public void requireCredentials(AutomationConfig config) {
        if (config.hasCredentials()) {
            return;
        }
        throw new SkipException("TEST_USERNAME and TEST_PASSWORD are required for this scenario");
    }

    public void requireDatasetIfConfigured(AutomationConfig config) {
        if (!config.hasDataset()) {
            return;
        }
        Path workbookPath = Path.of(config.dataSettings().workbookPath());
        if (Files.exists(workbookPath)) {
            return;
        }
        throw new SkipException("DATA_WORKBOOK_PATH is configured but file is missing: " + workbookPath);
    }

    private boolean isReachable(String url) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(5))
                    .GET()
                    .build();
            HttpResponse<Void> response = httpClient.send(request, HttpResponse.BodyHandlers.discarding());
            return response.statusCode() > 0;
        } catch (Exception ex) {
            return false;
        }
    }
}
