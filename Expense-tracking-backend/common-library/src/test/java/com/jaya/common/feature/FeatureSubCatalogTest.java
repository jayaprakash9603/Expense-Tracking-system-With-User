package com.jaya.common.feature;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;
import org.junit.jupiter.api.Test;

class FeatureSubCatalogTest {

    @Test
    void parentDisabled_cascadesToSubFeature() {
        FeatureFlagProperties properties = new FeatureFlagProperties();
        properties.getModules().put(FeatureCatalog.FRIENDS, false);
        properties.getSubFeatures()
                .put(FeatureCatalog.FRIENDS, Map.of("chat", true));

        assertFalse(properties.isSubFeatureEnabled("friends.chat"));
    }

    @Test
    void subFeatureCanBeDisabledWhileParentEnabled() {
        FeatureFlagProperties properties = new FeatureFlagProperties();
        properties.getSubFeatures()
                .put(FeatureCatalog.EXPENSES, Map.of("reports", false));

        assertTrue(properties.isEnabled(FeatureCatalog.EXPENSES));
        assertFalse(properties.isSubFeatureEnabled("expenses.reports"));
        assertTrue(properties.isSubFeatureEnabled("expenses.list"));
    }

    @Test
    void friendContextBlockedWhenFriendsDisabled() {
        FeatureFlagProperties properties = new FeatureFlagProperties();
        properties.getModules().put(FeatureCatalog.FRIENDS, false);

        assertFalse(properties.isPathEnabled("/expenses/create/friend/12"));
    }

    @Test
    void adminReportsResolvedFromPath() {
        assertTrue(FeatureSubCatalog.subFeatureForPath("/api/admin/reports/export")
                .map("admin.reports"::equals)
                .orElse(false));
    }

    @Test
    void deleteActionResolvedFromHttpMethod() {
        assertTrue(FeatureSubCatalog.subFeatureForRequest("/api/expenses/delete/42", "DELETE")
                .map("expenses.delete"::equals)
                .orElse(false));
    }

    @Test
    void authOptInBlocksGoogleOauthWhenDisabled() {
        FeatureFlagProperties properties = new FeatureFlagProperties();
        properties.getSubFeatures().put(FeatureCatalog.AUTH, Map.of("googleOauth", false));

        assertFalse(properties.isRequestEnabled("/auth/oauth2/google", "POST"));
        assertTrue(properties.isRequestEnabled("/auth/signin", "POST"));
    }
}
