package com.jaya.automation.bdd.steps.ui.support;

import com.jaya.automation.bdd.context.BddWorld;

public final class AdminScenarioCoordinator {

    public void navigateToAdminDashboard() {
        String baseUrl = BddWorld.config().baseUrl();
        String normalized = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        BddWorld.testContext().uiEngine().navigateTo(normalized + "/admin/dashboard");
        BddWorld.setCurrentUrl(BddWorld.uiActionExecutor().currentUrl());
    }

    public void navigateToUserManagement() {
        String baseUrl = BddWorld.config().baseUrl();
        String normalized = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        BddWorld.testContext().uiEngine().navigateTo(normalized + "/admin/users");
        BddWorld.setCurrentUrl(BddWorld.uiActionExecutor().currentUrl());
    }

    public void navigateToAuditLogs() {
        String baseUrl = BddWorld.config().baseUrl();
        String normalized = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        BddWorld.testContext().uiEngine().navigateTo(normalized + "/admin/audit");
        BddWorld.setCurrentUrl(BddWorld.uiActionExecutor().currentUrl());
    }

    public boolean isAdminDashboardLoaded() {
        return BddWorld.domainNavigationFlow().admin().isLoaded();
    }
}
