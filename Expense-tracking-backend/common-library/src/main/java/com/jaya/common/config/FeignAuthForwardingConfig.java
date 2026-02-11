package com.jaya.common.config;

import feign.RequestInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * In monolithic mode, Feign calls loop back to localhost:8080 (the same app).
 * These requests hit Spring Security and need the Authorization header.
 * This interceptor forwards the JWT from the current incoming request
 * onto every outgoing Feign call.
 */
@Configuration
@Profile("monolithic")
@ConditionalOnClass(RequestInterceptor.class)
public class FeignAuthForwardingConfig {

    @Bean
    public RequestInterceptor authHeaderForwardingInterceptor() {
        return template -> {
            var requestAttributes = RequestContextHolder.getRequestAttributes();
            if (requestAttributes instanceof ServletRequestAttributes servletAttrs) {
                HttpServletRequest request = servletAttrs.getRequest();
                String authHeader = request.getHeader("Authorization");
                if (authHeader != null && !template.headers().containsKey("Authorization")) {
                    template.header("Authorization", authHeader);
                }
            }
        };
    }
}
