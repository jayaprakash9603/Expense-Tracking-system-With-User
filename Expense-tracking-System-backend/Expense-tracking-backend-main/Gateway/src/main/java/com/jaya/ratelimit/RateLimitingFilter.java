package com.jaya.ratelimit;

import com.jaya.error.exceptions.RateLimitExceededException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
@Component
public class RateLimitingFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(RateLimitingFilter.class);

    private final InMemoryRateLimiterService rateLimiter;

    public RateLimitingFilter(InMemoryRateLimiterService rateLimiter) {
        this.rateLimiter = rateLimiter;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange,
            org.springframework.cloud.gateway.filter.GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String userId = request.getHeaders().getFirst("X-User-ID");
        if (userId == null || userId.isBlank()) {
            userId = request.getRemoteAddress() != null ? request.getRemoteAddress().getAddress().getHostAddress()
                    : "unknown";
        }
        String key = userId + ":" + request.getPath().value();
        if (!rateLimiter.tryConsume(key)) {
            int remaining = rateLimiter.remaining(key);
            log.warn("Rate limit exceeded user={} path={} remaining={}", userId, request.getPath().value(), remaining);
            throw new RateLimitExceededException("Rate limit exceeded for user " + userId);
        }
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return 0;
    }
}
