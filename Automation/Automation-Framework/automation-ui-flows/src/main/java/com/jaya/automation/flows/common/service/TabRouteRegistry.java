package com.jaya.automation.flows.common.service;

import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

public final class TabRouteRegistry {
    public static final String LOGIN_PATH = "/login";
    public static final String REGISTER_PATH = "/register";
    public static final String DASHBOARD_PATH = "/dashboard";

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
        routes.put(normalize("Login"), LOGIN_PATH);
        routes.put(normalize("Signup"), REGISTER_PATH);
        routes.put(normalize("Dashboard"), DASHBOARD_PATH);
        routes.put(normalize("Home"), DASHBOARD_PATH);
        routes.put(normalize("Expenses"), "/expenses");
        routes.put(normalize("Categories"), "/category-flow");
        routes.put(normalize("Payments"), "/payment-method");
        routes.put(normalize("Bill"), "/bill");
        routes.put(normalize("Friends"), "/friends");
        routes.put(normalize("Groups"), "/groups");
        routes.put(normalize("Budgets"), "/budget");
        routes.put(normalize("Reports"), "/reports");
        routes.put(normalize("Utilities"), "/utilities");
        routes.put(normalize("Profile"), "/profile");
        routes.put(normalize("Forgot Password"), "/forgot-password");
        routes.put(normalize("Create Expense"), "/expenses/create");
        routes.put(normalize("Create Bill"), "/bill/create");
        routes.put(normalize("Create Category"), "/category-flow/create");
        routes.put(normalize("Create Payment"), "/payment-method/create");
        routes.put(normalize("Create Budget"), "/budget/create");
        routes.put(normalize("Create Group"), "/groups/create");
        routes.put(normalize("Chats"), "/chats");
        routes.put(normalize("Notifications"), "/settings/notifications");
        routes.put(normalize("MFA Setup"), "/settings/mfa");
        routes.put(normalize("Calendar"), "/calendar-view");
        routes.put(normalize("Cashflow"), "/cashflow");
        routes.put(normalize("Transactions"), "/transactions");
        routes.put(normalize("Insights"), "/insights");
        routes.put(normalize("My Shares"), "/my-shares");
        routes.put(normalize("Friendship Report"), "/friends/report");
        routes.put(normalize("Expense Reports"), "/expenses/reports");
        routes.put(normalize("Category Reports"), "/category-flow/reports");
        routes.put(normalize("Budget Reports"), "/budget/reports");
        routes.put(normalize("Bill Report"), "/bill/report");
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
