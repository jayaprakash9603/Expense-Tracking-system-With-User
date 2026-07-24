package com.jaya.feature;

import com.jaya.common.feature.FeatureCatalog;
import com.jaya.common.feature.FeatureFlagProperties;
import com.jaya.common.feature.FeatureSubCatalog;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class DormantFeatureFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(DormantFeatureFilter.class);

    private final FeatureFlagProperties properties;

    public DormantFeatureFilter(FeatureFlagProperties properties) {
        this.properties = properties;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        if (!properties.isDormancyEnabled()) {
            return chain.filter(exchange);
        }

        String path = exchange.getRequest().getURI().getPath();
        String method = exchange.getRequest().getMethod().name();
        if (!properties.isRequestEnabled(path, method)) {
            var subFeature = FeatureSubCatalog.subFeatureForRequest(path, method);
            var module = FeatureCatalog.featureForPath(path);
            String blocked = subFeature.orElse(module.orElse("unknown"));
            log.warn("Blocked request to dormant feature '{}' at path: {}", blocked, path);
            exchange.getResponse().setStatusCode(HttpStatus.NOT_FOUND);
            return exchange.getResponse().setComplete();
        }

        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 1;
    }
}
