package com.jaya.automation.bdd.context;

import com.jaya.automation.core.config.AutomationConfig;
import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;
import org.testng.SkipException;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.net.ConnectException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.cert.X509Certificate;
import java.time.Duration;

public final class DependencyGuard {
    private static final AutomationLogger LOG = LoggerFactory.getLogger(DependencyGuard.class);
    private static final int MAX_ATTEMPTS = 2;
    private static final long RETRY_DELAY_MS = 2000;
    private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(5);
    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(8);
    private final HttpClient httpClient;

    public DependencyGuard() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(CONNECT_TIMEOUT)
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
        if (url == null || url.isBlank()) {
            throw new SkipException(endpointName + " URL is not configured. Set it in AutomationConfiguration.yaml.");
        }
        LOG.info("Checking reachability: {} at {}", endpointName, url);
        if (isReachableWithRetry(url)) {
            LOG.info("{} is reachable at {}", endpointName, url);
            return;
        }
        throw new SkipException(endpointName + " is not reachable at " + url + ". Start target service and retry.");
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

    private boolean isReachableWithRetry(String url) {
        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            ReachabilityResult result = probe(url);
            if (result.reachable) {
                return true;
            }
            if (result.connectionRefused) {
                LOG.info("Connection refused at {} — service is not running, skipping retries", url);
                return false;
            }
            if (attempt < MAX_ATTEMPTS) {
                LOG.debug("Attempt {}/{} failed for {} — retrying in {}ms", attempt, MAX_ATTEMPTS, url, RETRY_DELAY_MS);
                sleepQuietly(RETRY_DELAY_MS);
            }
        }
        return false;
    }

    private ReachabilityResult probe(String url) {
        ReachabilityResult headResult = sendProbe(url, "HEAD");
        if (headResult.reachable) {
            return headResult;
        }
        if (headResult.connectionRefused) {
            return headResult;
        }
        return sendProbe(url, "GET");
    }

    private ReachabilityResult sendProbe(String url, String method) {
        try {
            HttpRequest.Builder builder = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(REQUEST_TIMEOUT);
            HttpRequest request = "HEAD".equals(method)
                    ? builder.method("HEAD", HttpRequest.BodyPublishers.noBody()).build()
                    : builder.GET().build();
            HttpResponse<Void> response = httpClient.send(request, HttpResponse.BodyHandlers.discarding());
            return ReachabilityResult.reachable();
        } catch (ConnectException ex) {
            return ReachabilityResult.refused();
        } catch (HttpTimeoutException ex) {
            return ReachabilityResult.unreachable();
        } catch (Exception ex) {
            boolean refused = isConnectionRefused(ex);
            return refused ? ReachabilityResult.refused() : ReachabilityResult.unreachable();
        }
    }

    private boolean isConnectionRefused(Throwable ex) {
        Throwable cause = ex;
        while (cause != null) {
            if (cause instanceof ConnectException) {
                return true;
            }
            String message = cause.getMessage();
            if (message != null && message.contains("Connection refused")) {
                return true;
            }
            cause = cause.getCause();
        }
        return false;
    }

    private void sleepQuietly(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
        }
    }

    private static final class ReachabilityResult {
        final boolean reachable;
        final boolean connectionRefused;

        private ReachabilityResult(boolean reachable, boolean connectionRefused) {
            this.reachable = reachable;
            this.connectionRefused = connectionRefused;
        }

        static ReachabilityResult reachable() { return new ReachabilityResult(true, false); }
        static ReachabilityResult refused() { return new ReachabilityResult(false, true); }
        static ReachabilityResult unreachable() { return new ReachabilityResult(false, false); }
    }
}
