package com.jaya.feature;

import com.jaya.common.feature.FeatureFlagProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(FeatureFlagProperties.class)
public class FeatureDormancyConfiguration {
}
