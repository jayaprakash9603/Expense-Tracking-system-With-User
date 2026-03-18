package com.jaya.automation.bdd.context;

import com.jaya.automation.core.config.AutomationConfig;
import org.testng.SkipException;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.nio.file.Files;
import java.nio.file.Path;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.cert.X509Certificate;
import java.time.Duration;

public final class DependencyGuard {
    private static final int REACHABILITY_ATTEMPTS = 4;
    private static final long RETRY_DELAY_MS = 1500;
    private final HttpClient httpClient;

    public DependencyGuard() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .followRedirects(HttpClient.Redirect.ALWAYS)
                .sslContext(buildTrustAllSslContext())
                .build();
    }

    private static SSLContext buildTrustAllSslContext() {
        try {
            TrustManager[] trustAll = {new X509TrustManager() {
                @Override public void checkClientTrusted(X509Certificate[] chain, String authType) { }
                @Override public void checkServerTrusted(X509Certificate[] chain, String authType) { }
                @Override public X509Certificate[] getAcceptedIssuers() { return new X509Certificate[0]; }
            }};
            SSLContext sslContext = SSLContext.getInstance("TLS");
            sslContext.init(null, trustAll, new java.security.SecureRandom());
            return sslContext;
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to create trust-all SSL context", ex);
        }
    }

    public void requireReachable(String endpointName, String url) {
        if (isReachableWithRetry(url)) {
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
                    .timeout(Duration.ofSeconds(15))
                    .method("HEAD", HttpRequest.BodyPublishers.noBody())
                    .build();
            HttpResponse<Void> response = httpClient.send(request, HttpResponse.BodyHandlers.discarding());
            return response.statusCode() > 0;
        } catch (Exception ex) {
            return isReachableViaGet(url);
        }
    }

    private boolean isReachableViaGet(String url) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(15))
                    .GET()
                    .build();
            HttpResponse<Void> response = httpClient.send(request, HttpResponse.BodyHandlers.discarding());
            return response.statusCode() > 0;
        } catch (Exception ex) {
            return false;
        }
    }

    private boolean isReachableWithRetry(String url) {
        for (int attempt = 1; attempt <= REACHABILITY_ATTEMPTS; attempt++) {
            if (isReachableCandidate(url)) {
                return true;
            }
            if (attempt < REACHABILITY_ATTEMPTS) {
                sleepBeforeRetry();
            }
        }
        return false;
    }

    private boolean isReachableCandidate(String url) {
        if (isReachable(url)) {
            return true;
        }
        String fallbackUrl = fallbackUrl(url);
        return fallbackUrl != null && isReachable(fallbackUrl);
    }

    private String fallbackUrl(String url) {
        if (url == null || url.isBlank()) {
            return null;
        }
        if (url.contains("/login")) {
            return null;
        }
        return url.endsWith("/") ? url + "login" : url + "/login";
    }

    private void sleepBeforeRetry() {
        try {
            Thread.sleep(RETRY_DELAY_MS);
        } catch (InterruptedException interruptedException) {
            Thread.currentThread().interrupt();
        }
    }
}
