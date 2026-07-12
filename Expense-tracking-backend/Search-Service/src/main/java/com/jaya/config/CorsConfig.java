package com.jaya.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Configuration
public class CorsConfig {

    private static final String DEFAULT_ORIGIN_PATTERNS =
            "http://localhost:*,https://localhost:*,http://127.0.0.1:*,https://127.0.0.1:*,"
                    + "https://jayaprakash.netlify.app,https://jjayaprakash.netlify.app";

    @Bean
    public CorsFilter corsFilter(Environment environment) {
        CorsConfiguration config = new CorsConfiguration();

        String rawOrigins =
                environment.getProperty("ALLOWED_ORIGIN_PATTERNS", DEFAULT_ORIGIN_PATTERNS);
        List<String> allowedOriginPatterns = Stream.of(rawOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .collect(Collectors.toList());
        config.setAllowedOriginPatterns(allowedOriginPatterns);

        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));

        config.setAllowedHeaders(Collections.singletonList("*"));

        config.setExposedHeaders(Arrays.asList("Authorization"));

        config.setAllowCredentials(true);

        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
