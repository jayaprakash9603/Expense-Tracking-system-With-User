package com.jaya.automation.flows.common.locator;

import com.jaya.automation.core.ui.Locator;
import com.jaya.automation.core.ui.UiEngine;

import java.util.List;

public record LocatorSet(String name, List<Locator> candidates) {
    public Locator resolve(UiEngine uiEngine) {
        return candidates.stream()
                .filter(locator -> uiEngine.elements().exists(locator))
                .findFirst()
                .orElse(candidates.get(0));
    }

    public static LocatorSet of(String name, Locator... locators) {
        return new LocatorSet(name, List.of(locators));
    }
}
