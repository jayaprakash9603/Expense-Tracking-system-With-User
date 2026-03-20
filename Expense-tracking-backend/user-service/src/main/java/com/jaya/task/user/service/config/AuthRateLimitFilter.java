package com.jaya.task.user.service.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayDeque;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Profile("!test")
public class AuthRateLimitFilter extends OncePerRequestFilter {

    private static final int DEFAULT_MAX = 40;
    private static final long WINDOW_MS = 60_000L;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ConcurrentHashMap<String, ArrayDeque<Long>> buckets = new ConcurrentHashMap<>();

    @Value("${AUTH_RATE_LIMIT_PER_MINUTE:40}")
    private int maxRequestsPerWindow;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (!"POST".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getServletPath();
        if (!path.endsWith("/auth/signin") && !path.endsWith("/auth/signup") && !path.endsWith("/auth/check-email")) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientKey = resolveClientKey(request);
        long now = System.currentTimeMillis();
        int limit = maxRequestsPerWindow > 0 ? maxRequestsPerWindow : DEFAULT_MAX;

        ArrayDeque<Long> window = buckets.computeIfAbsent(clientKey, k -> new ArrayDeque<>());
        synchronized (window) {
            while (!window.isEmpty() && now - window.peekFirst() > WINDOW_MS) {
                window.pollFirst();
            }
            if (window.size() >= limit) {
                writeTooManyRequests(response);
                return;
            }
            window.addLast(now);
        }

        filterChain.doFilter(request, response);
    }

    private static String resolveClientKey(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "unknown";
    }

    private void writeTooManyRequests(HttpServletResponse response) throws IOException {
        response.setStatus(429);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("error", "Too Many Requests");
        body.put("message", "Too many authentication attempts. Try again later.");
        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
