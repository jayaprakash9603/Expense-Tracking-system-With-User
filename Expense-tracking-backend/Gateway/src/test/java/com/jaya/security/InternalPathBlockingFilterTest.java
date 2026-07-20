package com.jaya.security;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;

class InternalPathBlockingFilterTest {

    private final InternalPathBlockingFilter filter = new InternalPathBlockingFilter(new InternalBlockProperties());

    @Test
    void blocksPathsContainingInternalSegment() {
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/expenses/internal/get-by-id").build());

        filter.filter(exchange, ex -> ex.getResponse().setComplete()).block();

        assert exchange.getResponse().getStatusCode() == HttpStatus.NOT_FOUND;
    }

    @Test
    void allowsPublicPaths() {
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/expenses/summary-expenses").build());

        filter.filter(exchange, ex -> {
            ex.getResponse().setStatusCode(HttpStatus.OK);
            return ex.getResponse().setComplete();
        }).block();

        assert exchange.getResponse().getStatusCode() == HttpStatus.OK;
    }
}
