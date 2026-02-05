package com.jaya.error;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Component
public class CorrelationFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(CorrelationFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange,
            org.springframework.cloud.gateway.filter.GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String incoming = request.getHeaders().getFirst("X-Request-ID");
        final String requestId = (incoming == null || incoming.isBlank()) ? UUID.randomUUID().toString() : incoming;
        if (incoming == null || incoming.isBlank()) {
            exchange.getRequest().mutate().header("X-Request-ID", requestId).build();
        }
        long start = System.currentTimeMillis();
        log.info("Incoming request id={} method={} path={}", requestId, request.getMethod(),
                request.getURI().getPath());
        return chain.filter(exchange)
                .doOnError(err -> log.error("Request failed id={} path={} error={}", requestId,
                        request.getURI().getPath(), err.getMessage()))
                .doFinally(sig -> {
                    long dur = System.currentTimeMillis() - start;
                    log.info("Completed request id={} status={} durationMs={}", requestId,
                            exchange.getResponse().getStatusCode(), dur);
                });
    }

    @Override
    public int getOrder() {
        return -1;
    }
}