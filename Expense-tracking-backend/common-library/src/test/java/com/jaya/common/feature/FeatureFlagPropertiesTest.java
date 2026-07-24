package com.jaya.common.feature;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;
import org.junit.jupiter.api.Test;

class FeatureFlagPropertiesTest {

    @Test
    void isEnabled_returnsTrueWhenDormancyDisabled() {
        FeatureFlagProperties properties = new FeatureFlagProperties();
        properties.getDormancy().setEnabled(false);
        properties.getModules().put(FeatureCatalog.GROUPS, false);

        assertTrue(properties.isEnabled(FeatureCatalog.GROUPS));
    }

    @Test
    void isEnabled_returnsFalseForDisabledModule() {
        FeatureFlagProperties properties = new FeatureFlagProperties();
        properties.getModules().put(FeatureCatalog.GROUPS, false);

        assertFalse(properties.isEnabled(FeatureCatalog.GROUPS));
    }

    @Test
    void resolvedModules_includesAllCatalogKeys() {
        FeatureFlagProperties properties = new FeatureFlagProperties();
        properties.getModules().put(FeatureCatalog.GROUPS, false);

        Map<String, Boolean> resolved = properties.resolvedModules();

        assertEquals(FeatureCatalog.allFeatureKeys().size(), resolved.size());
        assertFalse(resolved.get(FeatureCatalog.GROUPS));
        assertTrue(resolved.get(FeatureCatalog.EXPENSES));
    }

    @Test
    void resolvedSubFeatures_reflectsCascade() {
        FeatureFlagProperties properties = new FeatureFlagProperties();
        properties.getModules().put(FeatureCatalog.ADMIN, false);

        Map<String, Boolean> resolved = properties.resolvedSubFeatures();

        assertFalse(resolved.get("admin.reports"));
        assertFalse(resolved.get("admin.users"));
    }
}
