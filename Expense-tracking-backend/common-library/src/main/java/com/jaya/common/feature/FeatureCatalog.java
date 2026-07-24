package com.jaya.common.feature;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public final class FeatureCatalog {

    public static final String EXPENSES = "expenses";
    public static final String BUDGETS = "budgets";
    public static final String CATEGORIES = "categories";
    public static final String PAYMENT_METHODS = "paymentMethods";
    public static final String BILLS = "bills";
    public static final String FRIENDS = "friends";
    public static final String GROUPS = "groups";
    public static final String SHARING = "sharing";
    public static final String REPORTS = "reports";
    public static final String CALENDAR = "calendar";
    public static final String UPLOAD = "upload";
    public static final String UTILITIES = "utilities";
    public static final String CHAT = "chat";
    public static final String STORIES = "stories";
    public static final String INVESTMENT = "investment";
    public static final String ANALYTICS = "analytics";
    public static final String NOTIFICATIONS = "notifications";
    public static final String KEYBOARD_SHORTCUTS = "keyboardShortcuts";
    public static final String SEARCH = "search";
    public static final String EVENTS = "events";
    public static final String HELP_SUPPORT = "helpSupport";
    public static final String ADMIN = "admin";
    public static final String AUTH = "auth";
    public static final String THEME_CUSTOMIZATION = "themeCustomization";

    private static final List<String> ALL_FEATURE_KEYS = List.of(
            EXPENSES,
            BUDGETS,
            CATEGORIES,
            PAYMENT_METHODS,
            BILLS,
            FRIENDS,
            GROUPS,
            SHARING,
            REPORTS,
            CALENDAR,
            UPLOAD,
            UTILITIES,
            CHAT,
            STORIES,
            INVESTMENT,
            ANALYTICS,
            NOTIFICATIONS,
            KEYBOARD_SHORTCUTS,
            SEARCH,
            EVENTS,
            HELP_SUPPORT,
            ADMIN,
            AUTH,
            THEME_CUSTOMIZATION
    );

    private static final List<String> ALWAYS_ON = List.of("dashboard", "settings", "profile");

    private static final List<String> CORE_PATH_PREFIXES = List.of(
            "/auth",
            "/api/user",
            "/api/settings",
            "/api/config",
            "/api/roles",
            "/api/permissions"
    );

    private static final Map<String, List<String>> BACKEND_PATHS = buildBackendPaths();

    private FeatureCatalog() {
    }

    public static List<String> allFeatureKeys() {
        return ALL_FEATURE_KEYS;
    }

    public static boolean isAlwaysOn(String featureKey) {
        return ALWAYS_ON.contains(featureKey);
    }

    public static boolean isCorePath(String path) {
        if (path == null || path.isBlank()) {
            return true;
        }
        String normalized = normalizePath(path);
        for (String prefix : CORE_PATH_PREFIXES) {
            if (normalized.equals(prefix) || normalized.startsWith(prefix + "/")) {
                return true;
            }
        }
        return false;
    }

    public static Optional<String> featureForPath(String path) {
        if (path == null || path.isBlank() || isCorePath(path)) {
            return Optional.empty();
        }

        String normalized = normalizePath(path);
        String bestMatch = null;
        int bestLength = -1;

        for (Map.Entry<String, List<String>> entry : BACKEND_PATHS.entrySet()) {
            for (String prefix : entry.getValue()) {
                if (matchesPrefix(normalized, prefix) && prefix.length() > bestLength) {
                    bestMatch = entry.getKey();
                    bestLength = prefix.length();
                }
            }
        }

        return Optional.ofNullable(bestMatch);
    }

    public static Map<String, List<String>> backendPaths() {
        return BACKEND_PATHS;
    }

    private static boolean matchesPrefix(String path, String prefix) {
        return path.equals(prefix) || path.startsWith(prefix + "/");
    }

    private static String normalizePath(String path) {
        String normalized = path.trim();
        if (!normalized.startsWith("/")) {
            normalized = "/" + normalized;
        }
        if (normalized.length() > 1 && normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        return normalized;
    }

    private static Map<String, List<String>> buildBackendPaths() {
        Map<String, List<String>> paths = new LinkedHashMap<>();
        paths.put(EXPENSES, List.of("/api/expenses", "/api/bulk", "/daily-summary"));
        paths.put(BUDGETS, List.of("/api/budgets"));
        paths.put(CATEGORIES, List.of("/api/categories"));
        paths.put(PAYMENT_METHODS, List.of("/api/payment-methods"));
        paths.put(BILLS, List.of("/api/bills"));
        paths.put(FRIENDS, List.of("/api/friendships", "/api/activities"));
        paths.put(GROUPS, List.of("/api/groups"));
        paths.put(SHARING, List.of("/api/shares"));
        paths.put(CHAT, List.of("/api/chats", "/chat"));
        paths.put(STORIES, List.of("/api/stories", "/api/admin/stories", "/ws-stories"));
        paths.put(INVESTMENT, List.of("/api/investment"));
        paths.put(ANALYTICS, List.of("/api/analytics"));
        paths.put(NOTIFICATIONS, List.of("/api/notifications", "/notifications", "/api/notification-preferences"));
        paths.put(KEYBOARD_SHORTCUTS, List.of("/api/shortcuts"));
        paths.put(SEARCH, List.of("/api/search"));
        paths.put(EVENTS, List.of("/api/events"));
        paths.put(ADMIN, List.of("/api/admin"));
        return Collections.unmodifiableMap(paths);
    }

    public static List<String> defaultEnabledModules() {
        List<String> defaults = new ArrayList<>(ALL_FEATURE_KEYS);
        return Collections.unmodifiableList(defaults);
    }
}
