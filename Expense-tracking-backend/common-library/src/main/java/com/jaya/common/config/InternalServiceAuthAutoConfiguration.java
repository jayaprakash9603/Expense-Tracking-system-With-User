package com.jaya.common.config;

import com.jaya.common.security.InternalServiceAuthFilter;
import com.jaya.common.security.InternalServiceAuthHeaders;
import feign.RequestInterceptor;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.core.Ordered;

@AutoConfiguration
@EnableConfigurationProperties(InternalServiceAuthProperties.class)
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
@ConditionalOnProperty(name = "common-library.internal-service-auth.enabled", havingValue = "true", matchIfMissing = true)
public class InternalServiceAuthAutoConfiguration {

    @Bean
    public FilterRegistrationBean<InternalServiceAuthFilter> internalServiceAuthFilterRegistration(
            InternalServiceAuthProperties properties) {
        FilterRegistrationBean<InternalServiceAuthFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new InternalServiceAuthFilter(properties));
        registration.addUrlPatterns("/*");
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE);
        registration.setName("internalServiceAuthFilter");
        return registration;
    }

    @Bean
    public InternalServiceAuthHeaders internalServiceAuthHeaders(InternalServiceAuthProperties properties) {
        return new InternalServiceAuthHeaders(properties);
    }

    @Bean
    @ConditionalOnClass(name = "feign.RequestInterceptor")
    @ConditionalOnProperty(name = "common-library.feign.enabled", havingValue = "true", matchIfMissing = true)
    public RequestInterceptor internalServiceTokenInterceptor(InternalServiceAuthProperties properties) {
        return template -> {
            String path = template.path();
            if (path == null || !com.jaya.common.security.InternalServiceAuthSupport.isInternalPath(path)) {
                return;
            }
            String token = properties.resolveToken();
            if (!token.isBlank()) {
                template.header(com.jaya.common.security.InternalServiceAuthSupport.SERVICE_TOKEN_HEADER, token);
            }
        };
    }
}
