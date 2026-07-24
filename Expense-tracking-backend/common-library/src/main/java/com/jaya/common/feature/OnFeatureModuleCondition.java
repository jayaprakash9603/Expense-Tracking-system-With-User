package com.jaya.common.feature;

import java.util.Map;
import org.springframework.boot.autoconfigure.condition.ConditionOutcome;
import org.springframework.boot.autoconfigure.condition.SpringBootCondition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;

class OnFeatureModuleCondition extends SpringBootCondition {

    @Override
    public ConditionOutcome getMatchOutcome(ConditionContext context, AnnotatedTypeMetadata metadata) {
        Map<String, Object> attributes =
                metadata.getAnnotationAttributes(ConditionalOnFeatureModule.class.getName());
        if (attributes == null) {
            return ConditionOutcome.noMatch("@ConditionalOnFeatureModule not present");
        }

        String module = (String) attributes.get("value");
        if (module == null || module.isBlank()) {
            return ConditionOutcome.noMatch("Feature module key is blank");
        }

        boolean dormancyEnabled =
                context.getEnvironment().getProperty("features.dormancy.enabled", Boolean.class, true);
        if (!dormancyEnabled) {
            return ConditionOutcome.match("Feature dormancy disabled");
        }

        Boolean enabled =
                context.getEnvironment().getProperty("features.modules." + module, Boolean.class);
        if (enabled != null && !enabled) {
            return ConditionOutcome.noMatch("Feature module '" + module + "' is disabled");
        }

        return ConditionOutcome.match("Feature module '" + module + "' is enabled");
    }
}
