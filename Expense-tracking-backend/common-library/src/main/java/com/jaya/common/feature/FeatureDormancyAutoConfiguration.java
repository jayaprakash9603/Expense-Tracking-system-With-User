package com.jaya.common.feature;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.core.Ordered;

@AutoConfiguration
@Slf4j
@EnableConfigurationProperties(FeatureFlagProperties.class)
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
public class FeatureDormancyAutoConfiguration {

    public FeatureDormancyAutoConfiguration() {
        log.info("Feature dormancy auto-configuration enabled");
    }

    @Bean
    public FeatureConfigController featureConfigController(FeatureFlagProperties properties) {
        return new FeatureConfigController(properties);
    }

    @Bean
    @ConditionalOnProperty(name = "features.dormancy.enabled", havingValue = "true", matchIfMissing = true)
    public FilterRegistrationBean<DormantFeatureFilter> dormantFeatureFilterRegistration(
            FeatureFlagProperties properties,
            ObjectMapper objectMapper) {
        FilterRegistrationBean<DormantFeatureFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new DormantFeatureFilter(properties, objectMapper));
        registration.addUrlPatterns("/*");
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE + 1);
        registration.setName("dormantFeatureFilter");
        return registration;
    }
}
