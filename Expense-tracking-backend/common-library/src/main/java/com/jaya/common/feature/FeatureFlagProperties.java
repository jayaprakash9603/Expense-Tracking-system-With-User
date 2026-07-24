package com.jaya.common.feature;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "features")
public class FeatureFlagProperties {

    private Dormancy dormancy = new Dormancy();
    private Map<String, Boolean> modules = new LinkedHashMap<>();
    private Map<String, Map<String, Boolean>> subFeatures = new LinkedHashMap<>();

    public boolean isDormancyEnabled() {
        return dormancy.isEnabled();
    }

    public boolean isEnabled(String featureKey) {
        if (!isDormancyEnabled()) {
            return true;
        }
        if (FeatureCatalog.isAlwaysOn(featureKey)) {
            return true;
        }

        if (featureKey != null && featureKey.contains(".")) {
            return isSubFeatureEnabled(featureKey);
        }

        Boolean enabled = modules.get(featureKey);
        return enabled == null || enabled;
    }

    public boolean isSubFeatureEnabled(String fullKey) {
        if (!isDormancyEnabled()) {
            return true;
        }

        var definition = FeatureSubCatalog.definitionForKey(fullKey);
        if (definition.isEmpty()) {
            return isEnabled(fullKey);
        }

        String parent = definition.get().parentModule();
        if (!isEnabled(parent)) {
            return false;
        }

        Boolean configured = subFeatures
                .getOrDefault(parent, Map.of())
                .get(definition.get().subKey());
        return configured == null || configured;
    }

    public boolean isPathEnabled(String path) {
        return isRequestEnabled(path, null);
    }

    public boolean isRequestEnabled(String path, String httpMethod) {
        if (!isDormancyEnabled()) {
            return true;
        }

        var authOptIn = FeatureSubCatalog.authOptInSubFeature(path, httpMethod);
        if (authOptIn.isPresent()) {
            return isSubFeatureEnabled(authOptIn.get());
        }

        if (FeatureCatalog.isCorePath(path)) {
            return true;
        }

        if (FeatureSubCatalog.isFriendContextPath(path) && !isEnabled(FeatureCatalog.FRIENDS)) {
            return false;
        }

        var subFeature = FeatureSubCatalog.subFeatureForRequest(path, httpMethod);
        if (subFeature.isPresent()) {
            return isSubFeatureEnabled(subFeature.get());
        }

        var module = FeatureCatalog.featureForPath(path);
        return module.map(this::isEnabled).orElse(true);
    }

    public Map<String, Boolean> resolvedModules() {
        Map<String, Boolean> resolved = new LinkedHashMap<>();
        for (String key : FeatureCatalog.allFeatureKeys()) {
            resolved.put(key, isEnabled(key));
        }
        return Collections.unmodifiableMap(resolved);
    }

    public Map<String, Boolean> resolvedSubFeatures() {
        Map<String, Boolean> resolved = new LinkedHashMap<>();
        for (FeatureSubCatalog.SubFeatureDefinition definition : FeatureSubCatalog.allDefinitions()) {
            resolved.put(definition.fullKey(), isSubFeatureEnabled(definition.fullKey()));
        }
        return Collections.unmodifiableMap(resolved);
    }

    @Data
    public static class Dormancy {
        private boolean enabled = true;
    }
}
