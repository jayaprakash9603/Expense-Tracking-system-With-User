package com.jaya.automation.engine.playwright;

import com.jaya.automation.core.ui.FrameScope;
import com.jaya.automation.core.ui.Locator;

final class PlaywrightFrameScope implements FrameScope {
    private final PlaywrightScope scope;
    private final PlaywrightLocatorResolver locatorResolver;

    PlaywrightFrameScope(PlaywrightScope scope, PlaywrightLocatorResolver locatorResolver) {
        this.scope = scope;
        this.locatorResolver = locatorResolver;
    }

    @Override
    public void enter(Locator frameLocator) {
        scope.enterFrame(locatorResolver.resolve(frameLocator));
    }

    @Override
    public void exitToRoot() {
        scope.exitToRoot();
    }
}
