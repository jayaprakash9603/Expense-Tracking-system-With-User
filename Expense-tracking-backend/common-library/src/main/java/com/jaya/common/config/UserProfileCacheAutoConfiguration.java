package com.jaya.common.config;

import com.jaya.common.cache.user.ClientRequestUserCacheFilter;
import com.jaya.common.cache.user.UserProfileCacheProperties;
import com.jaya.common.cache.user.UserProfileClientCacheStore;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.core.Ordered;

@AutoConfiguration
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
@ConditionalOnClass(name = "org.springframework.cloud.openfeign.FeignClient")
@ConditionalOnProperty(name = "common-library.user-profile-cache.enabled", havingValue = "true", matchIfMissing = true)
@EnableConfigurationProperties(UserProfileCacheProperties.class)
@ComponentScan(basePackages = "com.jaya.common.service.client")
public class UserProfileCacheAutoConfiguration {

    @Bean
    public UserProfileClientCacheStore userProfileClientCacheStore(UserProfileCacheProperties properties) {
        return new UserProfileClientCacheStore(properties);
    }

    @Bean
    public FilterRegistrationBean<ClientRequestUserCacheFilter> clientRequestUserCacheFilterRegistration() {
        FilterRegistrationBean<ClientRequestUserCacheFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new ClientRequestUserCacheFilter());
        registration.addUrlPatterns("/*");
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE);
        registration.setName("clientRequestUserCacheFilter");
        return registration;
    }
}
