package com.jaya.common.config;

import feign.RequestInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnClass(name = "feign.RequestInterceptor")
@ConditionalOnProperty(name = "common-library.feign.enabled", havingValue = "true", matchIfMissing = true)
public class UserServiceFeignConfig {

    @Bean
    public RequestInterceptor userServiceInternalTokenInterceptor(
            @Value("${USER_SERVICE_INTERNAL_TOKEN:}") String internalToken) {
        return template -> {
            if (internalToken == null || internalToken.isBlank()) {
                return;
            }
            String path = template.path();
            if (path != null
                    && (path.contains("/api/user/all")
                            || path.contains("/api/user/by-email")
                            || path.contains("/api/user/email"))) {
                template.header("X-Service-Token", internalToken);
            }
        };
    }
}
