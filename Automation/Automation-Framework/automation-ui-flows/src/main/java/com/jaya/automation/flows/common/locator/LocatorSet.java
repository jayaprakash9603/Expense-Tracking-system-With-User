package com.jaya.automation.flows.common.locator;

import com.jaya.automation.core.ui.Locator;
import com.jaya.automation.core.ui.UiEngine;
import com.jaya.automation.core.util.RetryExecutor;

import java.util.List;

public record LocatorSet(String name, List<Locator> candidates) {
    private static final int DEFAULT_RESOLVE_RETRIES = 3;

    public Locator resolve(UiEngine uiEngine) {
        return candidates.stream()
                .filter(locator -> uiEngine.elements().exists(locator))
                .findFirst()
                .orElse(candidates.get(0));
    }

    public Locator resolveWithRetry(UiEngine uiEngine) {
        return resolveWithRetry(uiEngine, DEFAULT_RESOLVE_RETRIES);
    }

    public Locator resolveWithRetry(UiEngine uiEngine, int maxAttempts) {
        return RetryExecutor.execute(() -> {
            Locator found = candidates.stream()
                    .filter(locator -> uiEngine.elements().exists(locator))
                    .findFirst()
                    .orElse(null);
            if (found == null) {
                throw new IllegalStateException("No matching locator found for '" + name + "' among " + candidates.size() + " candidates");
            }
            return found;
        }, maxAttempts);
    }

    public static LocatorSet of(String name, Locator... locators) {
        return new LocatorSet(name, List.of(locators));
    }
}
