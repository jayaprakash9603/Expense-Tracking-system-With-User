package com.jaya.common.config;

import feign.RequestInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Forwards the JWT Authorization header from the current incoming request
 * onto every outgoing Feign call. Required in both monolithic and microservices
 * modes since downstream services enforce authentication.
 *
 * For background threads where the servlet request is unavailable, callers can
 * set the token via {@link #setAsyncAuthToken(String)} before making Feign calls.
 */
@Configuration
@ConditionalOnClass(RequestInterceptor.class)
public class FeignAuthForwardingConfig {

    private static final ThreadLocal<String> asyncAuthToken = new ThreadLocal<>();

    /** Set the JWT for use in background/async threads where RequestContext is unavailable. */
    public static void setAsyncAuthToken(String token) {
        asyncAuthToken.set(token);
    }

    /** Clear the async JWT — call in a finally block to prevent thread-pool leaks. */
    public static void clearAsyncAuthToken() {
        asyncAuthToken.remove();
    }

    @Bean
    public RequestInterceptor authHeaderForwardingInterceptor() {
        return template -> {
            if (template.headers().containsKey("Authorization")) {
                return;
            }

            // 1. Try the current HTTP request context (normal request thread)
            var requestAttributes = RequestContextHolder.getRequestAttributes();
            if (requestAttributes instanceof ServletRequestAttributes servletAttrs) {
                HttpServletRequest request = servletAttrs.getRequest();
                String authHeader = request.getHeader("Authorization");
                if (authHeader != null) {
                    template.header("Authorization", authHeader);
                    return;
                }
            }

            // 2. Fallback: async/background thread token
            String token = asyncAuthToken.get();
            if (token != null) {
                template.header("Authorization", token);
            }
        };
    }
}
