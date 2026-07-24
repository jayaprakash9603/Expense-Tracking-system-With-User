package com.jaya.common.feature;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

public class DormantFeatureFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(DormantFeatureFilter.class);

    private final FeatureFlagProperties properties;
    private final ObjectMapper objectMapper;

    public DormantFeatureFilter(FeatureFlagProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        if (!properties.isDormancyEnabled()) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getRequestURI();
        if (!properties.isRequestEnabled(path, request.getMethod())) {
            var subFeature = FeatureSubCatalog.subFeatureForRequest(path, request.getMethod());
            var module = FeatureCatalog.featureForPath(path);
            String blocked = subFeature.orElse(module.orElse("unknown"));
            log.warn("Blocked request to dormant feature '{}' at path: {}", blocked, path);
            writeNotFound(response, blocked);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void writeNotFound(HttpServletResponse response, String featureKey) throws IOException {
        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(
                response.getWriter(),
                Map.of(
                        "status", 404,
                        "error", "Not Found",
                        "message", "Feature '" + featureKey + "' is currently unavailable"));
    }
}
