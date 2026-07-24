package com.jaya.common.feature;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class FeatureCatalogTest {

    @Test
    void featureForPath_resolvesLongestMatchingPrefix() {
        assertEquals(
                FeatureCatalog.STORIES,
                FeatureCatalog.featureForPath("/api/admin/stories/123").orElse(null));
        assertEquals(
                FeatureCatalog.ADMIN,
                FeatureCatalog.featureForPath("/api/admin/users").orElse(null));
    }

    @Test
    void isCorePath_excludesAuthAndConfig() {
        assertTrue(FeatureCatalog.isCorePath("/auth/signin"));
        assertTrue(FeatureCatalog.isCorePath("/api/config/features"));
        assertFalse(FeatureCatalog.isCorePath("/api/groups/1"));
    }

    @Test
    void featureForPath_returnsEmptyForCorePaths() {
        assertTrue(FeatureCatalog.featureForPath("/api/settings").isEmpty());
    }
}
