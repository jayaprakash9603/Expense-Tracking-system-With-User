package com.jaya.common.feature;

import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeatureConfigResponse {
    private boolean dormancyEnabled;
    private Map<String, Boolean> modules;
    private Map<String, Boolean> subFeatures;
}
