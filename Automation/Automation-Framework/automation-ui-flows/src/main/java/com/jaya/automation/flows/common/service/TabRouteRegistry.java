package com.jaya.automation.flows.common.service;

import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

public final class TabRouteRegistry {
    private final Map<String, String> labelToPath;

    public TabRouteRegistry() {
        this.labelToPath = buildRoutes();
    }

    public String requirePath(String tabLabel) {
        String path = labelToPath.get(normalize(tabLabel));
        if (path == null) {
            throw new IllegalArgumentException("Unsupported tab label: " + tabLabel);
        }
        return path;
    }

    private Map<String, String> buildRoutes() {
        Map<String, String> routes = new LinkedHashMap<>();
        routes.put(normalize("Login"), "/login");
        routes.put(normalize("Signup"), "/register");
        routes.put(normalize("Dashboard"), "/dashboard");
        routes.put(normalize("Home"), "/dashboard");
        routes.put(normalize("Expenses"), "/expenses");
        routes.put(normalize("Categories"), "/category-flow");
        routes.put(normalize("Payments"), "/payment-method");
        routes.put(normalize("Bill"), "/bill");
        routes.put(normalize("Friends"), "/friends");
        routes.put(normalize("Groups"), "/groups");
        routes.put(normalize("Budgets"), "/budget");
        routes.put(normalize("Reports"), "/reports");
        routes.put(normalize("Utilities"), "/utilities");
        routes.put(normalize("Admin Dashboard"), "/admin/dashboard");
        routes.put(normalize("User Management"), "/admin/users");
        routes.put(normalize("Role Management"), "/admin/roles");
        routes.put(normalize("System Analytics"), "/admin/analytics");
        routes.put(normalize("Audit Logs"), "/admin/audit");
        routes.put(normalize("Admin Reports"), "/admin/reports");
        routes.put(normalize("Admin Settings"), "/admin/settings");
        routes.put(normalize("Stories"), "/admin/stories");
        return routes;
    }

    private String normalize(String value) {
        return value.trim().toLowerCase(Locale.ROOT);
    }
}
