package com.jaya.feature;

import com.jaya.common.feature.FeatureConfigResponse;
import com.jaya.common.feature.FeatureFlagProperties;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/config")
public class FeatureConfigController {

    private final FeatureFlagProperties properties;

    public FeatureConfigController(FeatureFlagProperties properties) {
        this.properties = properties;
    }

    @GetMapping("/features")
    public Mono<ResponseEntity<FeatureConfigResponse>> getFeatures() {
        return Mono.just(ResponseEntity.ok(new FeatureConfigResponse(
                properties.isDormancyEnabled(),
                properties.resolvedModules(),
                properties.resolvedSubFeatures())));
    }
}
