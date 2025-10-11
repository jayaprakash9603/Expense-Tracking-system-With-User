package com.jaya.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Captures per-request context (timings, correlation id, client info) so that
 * service layer audit publishers can enrich AuditEvent without passing params everywhere.
 */
@Component
@Order(1)
public class AuditRequestFilter extends OncePerRequestFilter {

    public static final String ATTR_START_TIME = "requestStartTime";
    public static final String HDR_CORRELATION_ID = "X-Correlation-Id";
    public static final String ATTR_CORRELATION_ID = "correlationId";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        long start = System.currentTimeMillis();
        request.setAttribute(ATTR_START_TIME, start);

        // Correlation Id handling
        String correlationId = request.getHeader(HDR_CORRELATION_ID);
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = generateCorrelationId();
        }
        request.setAttribute(ATTR_CORRELATION_ID, correlationId);
        response.setHeader(HDR_CORRELATION_ID, correlationId);
        MDC.put("correlationId", correlationId);

        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.remove("correlationId");
        }
    }

    private String generateCorrelationId() {
        return "req-" + UUID.randomUUID();
    }
}
