package com.jaya.common.feature;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@RequestMapping("/api/config")
public class FeatureConfigController {

    private final FeatureFlagProperties properties;

    public FeatureConfigController(FeatureFlagProperties properties) {
        this.properties = properties;
    }

    @GetMapping("/features")
    @ResponseBody
    public ResponseEntity<FeatureConfigResponse> getFeatures() {
        return ResponseEntity.ok(new FeatureConfigResponse(
                properties.isDormancyEnabled(),
                properties.resolvedModules(),
                properties.resolvedSubFeatures()));
    }
}
