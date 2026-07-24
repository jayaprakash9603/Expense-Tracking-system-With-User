package com.jaya.common.feature;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/**
 * Sub-feature registry: granular flags under parent modules (e.g. expenses.reports).
 * Parent module disabled cascades to all child sub-features.
 */
public final class FeatureSubCatalog {

    public record SubFeatureDefinition(
            String parentModule,
            String subKey,
            List<String> frontendRoutePrefixes,
            List<String> backendPathPrefixes) {

        public String fullKey() {
            return parentModule + "." + subKey;
        }
    }

    public record WritePathRule(
            String parentModule,
            String subKey,
            String pathPrefix,
            Set<String> httpMethods) {
    }

    public record AuthOptInRule(
            String subKey,
            String pathPrefix,
            Set<String> httpMethods) {
    }

    private static final Set<String> WRITE_METHODS = Set.of("POST", "PUT", "PATCH", "DELETE");
    private static final Set<String> ALL_METHODS = Set.of("*");

    private static final List<SubFeatureDefinition> DEFINITIONS = buildDefinitions();
    private static final List<WritePathRule> WRITE_PATH_RULES = buildWritePathRules();
    private static final List<AuthOptInRule> AUTH_OPT_IN_RULES = buildAuthOptInRules();
    private static final Map<String, SubFeatureDefinition> BY_FULL_KEY = indexByFullKey();
    private static final Map<String, List<SubFeatureDefinition>> BY_PARENT = indexByParent();

    private FeatureSubCatalog() {
    }

    public static List<SubFeatureDefinition> allDefinitions() {
        return DEFINITIONS;
    }

    public static List<String> allSubFeatureKeys() {
        return DEFINITIONS.stream().map(SubFeatureDefinition::fullKey).toList();
    }

    public static List<SubFeatureDefinition> subFeaturesForModule(String parentModule) {
        return BY_PARENT.getOrDefault(parentModule, List.of());
    }

    public static Optional<String> parentModuleOf(String featureKey) {
        if (featureKey == null || !featureKey.contains(".")) {
            return Optional.empty();
        }
        int dot = featureKey.indexOf('.');
        return Optional.of(featureKey.substring(0, dot));
    }

    public static Optional<SubFeatureDefinition> definitionForKey(String fullKey) {
        return Optional.ofNullable(BY_FULL_KEY.get(fullKey));
    }

    public static Optional<String> subFeatureForPath(String path) {
        if (path == null || path.isBlank() || FeatureCatalog.isCorePath(path)) {
            return Optional.empty();
        }

        String normalized = normalizePath(path);
        String bestMatch = null;
        int bestLength = -1;

        for (SubFeatureDefinition definition : DEFINITIONS) {
            for (String prefix : definition.backendPathPrefixes()) {
                if (matchesPrefix(normalized, prefix) && prefix.length() > bestLength) {
                    bestMatch = definition.fullKey();
                    bestLength = prefix.length();
                }
            }
            for (String prefix : definition.frontendRoutePrefixes()) {
                if (matchesPrefix(normalized, prefix) && prefix.length() > bestLength) {
                    bestMatch = definition.fullKey();
                    bestLength = prefix.length();
                }
            }
        }

        return Optional.ofNullable(bestMatch);
    }

    public static Optional<String> subFeatureForRequest(String path, String httpMethod) {
        if (path == null || path.isBlank()) {
            return Optional.empty();
        }

        String normalized = normalizePath(path);
        String method = normalizeMethod(httpMethod);

        if (method != null && WRITE_METHODS.contains(method)) {
            String bestMatch = null;
            int bestLength = -1;

            for (WritePathRule rule : WRITE_PATH_RULES) {
                if (!matchesPrefix(normalized, rule.pathPrefix())) {
                    continue;
                }
                if (!rule.httpMethods().contains("*") && !rule.httpMethods().contains(method)) {
                    continue;
                }
                if (rule.pathPrefix().length() > bestLength) {
                    bestMatch = rule.parentModule() + "." + rule.subKey();
                    bestLength = rule.pathPrefix().length();
                }
            }

            if (bestMatch != null) {
                return Optional.of(bestMatch);
            }
        }

        return subFeatureForPath(path);
    }

    public static Optional<String> authOptInSubFeature(String path, String httpMethod) {
        if (path == null || path.isBlank()) {
            return Optional.empty();
        }

        String normalized = normalizePath(path);
        String method = normalizeMethod(httpMethod);
        String bestMatch = null;
        int bestLength = -1;

        for (AuthOptInRule rule : AUTH_OPT_IN_RULES) {
            if (!matchesPrefix(normalized, rule.pathPrefix())) {
                continue;
            }
            if (method != null
                    && !rule.httpMethods().contains("*")
                    && !rule.httpMethods().contains(method)) {
                continue;
            }
            if (rule.pathPrefix().length() > bestLength) {
                bestMatch = FeatureCatalog.AUTH + "." + rule.subKey();
                bestLength = rule.pathPrefix().length();
            }
        }

        return Optional.ofNullable(bestMatch);
    }

    public static boolean isFriendContextPath(String path) {
        if (path == null || path.isBlank()) {
            return false;
        }
        String normalized = normalizePath(path).toLowerCase();
        return normalized.contains("/friend/")
                || normalized.contains("/friend-")
                || normalized.endsWith("/friend")
                || normalized.matches(".*/friends/\\d+.*")
                || normalized.contains("friendid");
    }

    private static Map<String, SubFeatureDefinition> indexByFullKey() {
        Map<String, SubFeatureDefinition> map = new LinkedHashMap<>();
        for (SubFeatureDefinition definition : DEFINITIONS) {
            map.put(definition.fullKey(), definition);
        }
        return Collections.unmodifiableMap(map);
    }

    private static Map<String, List<SubFeatureDefinition>> indexByParent() {
        Map<String, List<SubFeatureDefinition>> map = new LinkedHashMap<>();
        for (SubFeatureDefinition definition : DEFINITIONS) {
            map.computeIfAbsent(definition.parentModule(), k -> new ArrayList<>()).add(definition);
        }
        map.replaceAll((k, v) -> Collections.unmodifiableList(v));
        return Collections.unmodifiableMap(map);
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

    private static String normalizeMethod(String httpMethod) {
        if (httpMethod == null || httpMethod.isBlank()) {
            return null;
        }
        return httpMethod.trim().toUpperCase();
    }

    private static List<SubFeatureDefinition> buildDefinitions() {
        List<SubFeatureDefinition> defs = new ArrayList<>();

        defs.add(sub(FeatureCatalog.EXPENSES, "create", List.of("/expenses/create"), List.of()));
        defs.add(sub(FeatureCatalog.EXPENSES, "edit", List.of("/expenses/edit"), List.of()));
        defs.add(sub(FeatureCatalog.EXPENSES, "view", List.of("/expenses/view"), List.of()));
        defs.add(sub(FeatureCatalog.EXPENSES, "delete", List.of(), List.of()));
        defs.add(sub(FeatureCatalog.EXPENSES, "share", List.of(), List.of()));
        defs.add(sub(FeatureCatalog.EXPENSES, "export", List.of(), List.of()));
        defs.add(sub(FeatureCatalog.EXPENSES, "list", List.of("/expenses", "/cashflow"), List.of()));
        defs.add(sub(
                FeatureCatalog.EXPENSES,
                "reports",
                List.of("/expenses/reports"),
                List.of("/api/expenses/summary-expenses", "/api/expenses/monthly-summary", "/daily-summary")));
        defs.add(sub(FeatureCatalog.EXPENSES, "bulkImport", List.of("/upload/expenses"), List.of("/api/bulk")));
        defs.add(sub(
                FeatureCatalog.EXPENSES,
                "transactions",
                List.of("/transactions", "/history"),
                List.of("/api/expenses/between-dates")));

        defs.add(sub(FeatureCatalog.BUDGETS, "create", List.of("/budget/create"), List.of()));
        defs.add(sub(FeatureCatalog.BUDGETS, "edit", List.of("/budget/edit"), List.of()));
        defs.add(sub(FeatureCatalog.BUDGETS, "view", List.of(), List.of()));
        defs.add(sub(FeatureCatalog.BUDGETS, "delete", List.of(), List.of()));
        defs.add(sub(FeatureCatalog.BUDGETS, "export", List.of(), List.of()));
        defs.add(sub(FeatureCatalog.BUDGETS, "list", List.of("/budget"), List.of("/api/budgets")));
        defs.add(sub(
                FeatureCatalog.BUDGETS,
                "reports",
                List.of("/budget/report", "/budget/reports", "/budget-report"),
                List.of("/api/budgets/report")));

        defs.add(sub(FeatureCatalog.CATEGORIES, "create", List.of("/category-flow/create"), List.of()));
        defs.add(sub(FeatureCatalog.CATEGORIES, "edit", List.of("/category-flow/edit"), List.of()));
        defs.add(sub(FeatureCatalog.CATEGORIES, "view", List.of("/category-flow/view"), List.of()));
        defs.add(sub(FeatureCatalog.CATEGORIES, "delete", List.of(), List.of()));
        defs.add(sub(FeatureCatalog.CATEGORIES, "export", List.of(), List.of()));
        defs.add(sub(FeatureCatalog.CATEGORIES, "list", List.of("/category-flow"), List.of("/api/categories")));
        defs.add(sub(FeatureCatalog.CATEGORIES, "reports", List.of("/category-flow/reports"), List.of()));
        defs.add(sub(FeatureCatalog.CATEGORIES, "calendar", List.of("/category-flow/calendar"), List.of()));
        defs.add(sub(FeatureCatalog.CATEGORIES, "analytics", List.of("/category-flow/view"), List.of()));

        defs.add(sub(FeatureCatalog.PAYMENT_METHODS, "create", List.of("/payment-method/create"), List.of()));
        defs.add(sub(FeatureCatalog.PAYMENT_METHODS, "edit", List.of("/payment-method/edit"), List.of()));
        defs.add(sub(FeatureCatalog.PAYMENT_METHODS, "view", List.of("/payment-method/view"), List.of()));
        defs.add(sub(FeatureCatalog.PAYMENT_METHODS, "delete", List.of(), List.of()));
        defs.add(sub(FeatureCatalog.PAYMENT_METHODS, "export", List.of(), List.of()));
        defs.add(sub(FeatureCatalog.PAYMENT_METHODS, "list", List.of("/payment-method"), List.of("/api/payment-methods")));
        defs.add(sub(FeatureCatalog.PAYMENT_METHODS, "reports", List.of("/payment-method/reports"), List.of()));
        defs.add(sub(FeatureCatalog.PAYMENT_METHODS, "calendar", List.of("/payment-method/calendar"), List.of()));
        defs.add(sub(FeatureCatalog.PAYMENT_METHODS, "analytics", List.of("/payment-method/view"), List.of()));

        defs.add(sub(FeatureCatalog.BILLS, "create", List.of("/bill/create"), List.of()));
        defs.add(sub(FeatureCatalog.BILLS, "edit", List.of("/bill/edit"), List.of()));
        defs.add(sub(FeatureCatalog.BILLS, "view", List.of(), List.of()));
        defs.add(sub(FeatureCatalog.BILLS, "delete", List.of(), List.of()));
        defs.add(sub(FeatureCatalog.BILLS, "export", List.of(), List.of()));
        defs.add(sub(FeatureCatalog.BILLS, "list", List.of("/bill"), List.of("/api/bills")));
        defs.add(sub(FeatureCatalog.BILLS, "reports", List.of("/bill/report"), List.of()));
        defs.add(sub(FeatureCatalog.BILLS, "upload", List.of("/bill/upload"), List.of()));
        defs.add(sub(FeatureCatalog.BILLS, "calendar", List.of("/bill/calendar"), List.of()));

        defs.add(sub(FeatureCatalog.FRIENDS, "create", List.of(), List.of()));
        defs.add(sub(FeatureCatalog.FRIENDS, "edit", List.of(), List.of()));
        defs.add(sub(FeatureCatalog.FRIENDS, "delete", List.of(), List.of()));
        defs.add(sub(FeatureCatalog.FRIENDS, "list", List.of("/friends"), List.of("/api/friendships")));
        defs.add(sub(FeatureCatalog.FRIENDS, "reports", List.of("/friends/report"), List.of()));
        defs.add(sub(FeatureCatalog.FRIENDS, "activity", List.of("/friends/activity"), List.of("/api/activities")));
        defs.add(sub(
                FeatureCatalog.FRIENDS,
                "chat",
                List.of("/friend-chat", "/friends/expenses"),
                List.of("/api/chats", "/chat")));

        defs.add(sub(FeatureCatalog.GROUPS, "create", List.of("/groups/create"), List.of()));
        defs.add(sub(FeatureCatalog.GROUPS, "edit", List.of(), List.of()));
        defs.add(sub(FeatureCatalog.GROUPS, "delete", List.of(), List.of()));
        defs.add(sub(FeatureCatalog.GROUPS, "view", List.of(), List.of()));
        defs.add(sub(FeatureCatalog.GROUPS, "export", List.of(), List.of()));
        defs.add(sub(FeatureCatalog.GROUPS, "list", List.of("/groups"), List.of("/api/groups")));

        defs.add(sub(FeatureCatalog.SHARING, "create", List.of("/my-shares/create"), List.of()));
        defs.add(sub(FeatureCatalog.SHARING, "edit", List.of(), List.of()));
        defs.add(sub(FeatureCatalog.SHARING, "delete", List.of(), List.of()));
        defs.add(sub(FeatureCatalog.SHARING, "myShares", List.of("/my-shares"), List.of("/api/shares")));
        defs.add(sub(FeatureCatalog.SHARING, "publicShares", List.of("/public-shares"), List.of()));
        defs.add(sub(FeatureCatalog.SHARING, "sharedWithMe", List.of("/shared-with-me"), List.of()));

        defs.add(sub(FeatureCatalog.REPORTS, "overview", List.of("/reports"), List.of()));
        defs.add(sub(FeatureCatalog.REPORTS, "transactions", List.of("/transactions"), List.of()));
        defs.add(sub(FeatureCatalog.REPORTS, "creditDue", List.of("/insights"), List.of()));
        defs.add(sub(FeatureCatalog.REPORTS, "export", List.of(), List.of()));

        defs.add(sub(FeatureCatalog.CALENDAR, "view", List.of("/calendar-view"), List.of()));
        defs.add(sub(FeatureCatalog.CALENDAR, "dayView", List.of("/day-view"), List.of()));
        defs.add(sub(FeatureCatalog.CALENDAR, "billDayView", List.of("/bill-day-view"), List.of()));
        defs.add(sub(FeatureCatalog.CALENDAR, "spendingMomentum", List.of(), List.of("/api/expenses/momentum-insight")));

        defs.add(sub(FeatureCatalog.UPLOAD, "expenses", List.of("/upload/expenses"), List.of()));
        defs.add(sub(FeatureCatalog.UPLOAD, "categories", List.of("/upload/categories"), List.of()));
        defs.add(sub(FeatureCatalog.UPLOAD, "payments", List.of("/upload/payments"), List.of()));

        defs.add(sub(FeatureCatalog.UTILITIES, "tools", List.of("/utilities"), List.of()));

        defs.add(sub(FeatureCatalog.CHAT, "messaging", List.of("/chats"), List.of("/api/chats", "/chat")));

        defs.add(sub(FeatureCatalog.ADMIN, "create", List.of("/admin/stories/create"), List.of()));
        defs.add(sub(FeatureCatalog.ADMIN, "edit", List.of("/admin/stories/edit"), List.of()));
        defs.add(sub(FeatureCatalog.ADMIN, "delete", List.of(), List.of()));
        defs.add(sub(FeatureCatalog.ADMIN, "export", List.of(), List.of()));
        defs.add(sub(FeatureCatalog.ADMIN, "dashboard", List.of("/admin/dashboard"), List.of("/api/admin/dashboard")));
        defs.add(sub(FeatureCatalog.ADMIN, "users", List.of("/admin/users"), List.of("/api/admin/users")));
        defs.add(sub(FeatureCatalog.ADMIN, "roles", List.of("/admin/roles"), List.of("/api/roles", "/api/permissions")));
        defs.add(sub(
                FeatureCatalog.ADMIN,
                "analytics",
                List.of("/admin/analytics"),
                List.of("/api/admin/analytics")));
        defs.add(sub(
                FeatureCatalog.ADMIN,
                "audit",
                List.of("/admin/audit"),
                List.of("/api/admin/audit-logs")));
        defs.add(sub(
                FeatureCatalog.ADMIN,
                "reports",
                List.of("/admin/reports"),
                List.of("/api/admin/reports")));
        defs.add(sub(FeatureCatalog.ADMIN, "settings", List.of("/admin/settings"), List.of()));
        defs.add(sub(
                FeatureCatalog.ADMIN,
                "stories",
                List.of("/admin/stories"),
                List.of("/api/admin/stories")));

        defs.add(sub(
                FeatureCatalog.NOTIFICATIONS,
                "preferences",
                List.of("/settings/notifications"),
                List.of("/api/notification-preferences", "/api/notifications")));
        defs.add(sub(FeatureCatalog.SEARCH, "universal", List.of(), List.of("/api/search")));
        defs.add(sub(FeatureCatalog.KEYBOARD_SHORTCUTS, "global", List.of(), List.of("/api/shortcuts")));
        defs.add(sub(FeatureCatalog.HELP_SUPPORT, "support", List.of("/support"), List.of()));
        defs.add(sub(FeatureCatalog.INVESTMENT, "dashboard", List.of("/component2"), List.of("/api/investment")));
        defs.add(sub(FeatureCatalog.STORIES, "feed", List.of(), List.of("/api/stories", "/ws-stories")));
        defs.add(sub(FeatureCatalog.EVENTS, "planning", List.of(), List.of("/api/events")));

        defs.add(sub(FeatureCatalog.AUTH, "googleOauth", List.of(), List.of("/auth/oauth2/google")));
        defs.add(sub(FeatureCatalog.AUTH, "mfa", List.of("/settings/mfa", "/mfa"), List.of()));
        defs.add(sub(FeatureCatalog.AUTH, "emailOtp", List.of("/otp-verification"), List.of()));

        return Collections.unmodifiableList(defs);
    }

    private static List<WritePathRule> buildWritePathRules() {
        List<WritePathRule> rules = new ArrayList<>();

        rules.add(write(FeatureCatalog.EXPENSES, "create", "/api/expenses/add-expense", Set.of("POST")));
        rules.add(write(FeatureCatalog.EXPENSES, "create", "/api/expenses/add-multiple", Set.of("POST")));
        rules.add(write(FeatureCatalog.EXPENSES, "create", "/api/expenses/save", Set.of("POST")));
        rules.add(write(FeatureCatalog.EXPENSES, "edit", "/api/expenses/edit-expense", Set.of("PUT", "PATCH")));
        rules.add(write(FeatureCatalog.EXPENSES, "edit", "/api/expenses/edit-multiple", Set.of("PUT", "PATCH")));
        rules.add(write(FeatureCatalog.EXPENSES, "delete", "/api/expenses/delete", Set.of("DELETE")));
        rules.add(write(FeatureCatalog.EXPENSES, "delete", "/api/expenses/delete-multiple", Set.of("DELETE")));
        rules.add(write(FeatureCatalog.EXPENSES, "delete", "/api/expenses/delete-all", Set.of("DELETE")));
        rules.add(write(FeatureCatalog.EXPENSES, "bulkImport", "/api/bulk", Set.of("POST")));
        rules.add(write(FeatureCatalog.EXPENSES, "share", "/api/expenses/expenses/delete-and-send", Set.of("POST")));
        rules.add(write(FeatureCatalog.EXPENSES, "export", "/api/expenses/reports", Set.of("POST")));

        rules.add(write(FeatureCatalog.BUDGETS, "create", "/api/budgets", Set.of("POST")));
        rules.add(write(FeatureCatalog.BUDGETS, "edit", "/api/budgets", Set.of("PUT", "PATCH")));
        rules.add(write(FeatureCatalog.BUDGETS, "delete", "/api/budgets", Set.of("DELETE")));

        rules.add(write(FeatureCatalog.CATEGORIES, "create", "/api/categories", Set.of("POST")));
        rules.add(write(FeatureCatalog.CATEGORIES, "edit", "/api/categories", Set.of("PUT", "PATCH")));
        rules.add(write(FeatureCatalog.CATEGORIES, "delete", "/api/categories", Set.of("DELETE")));

        rules.add(write(FeatureCatalog.PAYMENT_METHODS, "create", "/api/payment-methods", Set.of("POST")));
        rules.add(write(FeatureCatalog.PAYMENT_METHODS, "edit", "/api/payment-methods", Set.of("PUT", "PATCH")));
        rules.add(write(FeatureCatalog.PAYMENT_METHODS, "delete", "/api/payment-methods", Set.of("DELETE")));

        rules.add(write(FeatureCatalog.BILLS, "create", "/api/bills", Set.of("POST")));
        rules.add(write(FeatureCatalog.BILLS, "edit", "/api/bills", Set.of("PUT", "PATCH")));
        rules.add(write(FeatureCatalog.BILLS, "delete", "/api/bills", Set.of("DELETE")));

        rules.add(write(FeatureCatalog.FRIENDS, "create", "/api/friendships", Set.of("POST")));
        rules.add(write(FeatureCatalog.FRIENDS, "edit", "/api/friendships", Set.of("PUT", "PATCH")));
        rules.add(write(FeatureCatalog.FRIENDS, "delete", "/api/friendships", Set.of("DELETE")));

        rules.add(write(FeatureCatalog.GROUPS, "create", "/api/groups", Set.of("POST")));
        rules.add(write(FeatureCatalog.GROUPS, "edit", "/api/groups", Set.of("PUT", "PATCH")));
        rules.add(write(FeatureCatalog.GROUPS, "delete", "/api/groups", Set.of("DELETE")));

        rules.add(write(FeatureCatalog.SHARING, "create", "/api/shares", Set.of("POST")));
        rules.add(write(FeatureCatalog.SHARING, "edit", "/api/shares", Set.of("PUT", "PATCH")));
        rules.add(write(FeatureCatalog.SHARING, "delete", "/api/shares", Set.of("DELETE")));

        rules.add(write(FeatureCatalog.ADMIN, "create", "/api/admin/stories", Set.of("POST")));
        rules.add(write(FeatureCatalog.ADMIN, "edit", "/api/admin/stories", Set.of("PUT", "PATCH")));
        rules.add(write(FeatureCatalog.ADMIN, "delete", "/api/admin/stories", Set.of("DELETE")));
        rules.add(write(FeatureCatalog.ADMIN, "export", "/api/admin/reports", Set.of("POST")));

        return Collections.unmodifiableList(rules);
    }

    private static List<AuthOptInRule> buildAuthOptInRules() {
        List<AuthOptInRule> rules = new ArrayList<>();

        rules.add(auth("googleOauth", "/auth/oauth2/google", ALL_METHODS));
        rules.add(auth("mfa", "/auth/mfa/setup", ALL_METHODS));
        rules.add(auth("mfa", "/auth/mfa/enable", ALL_METHODS));
        rules.add(auth("mfa", "/auth/mfa/disable", ALL_METHODS));
        rules.add(auth("mfa", "/auth/mfa/regenerate-backup-codes", ALL_METHODS));
        rules.add(auth("mfa", "/auth/mfa/status", ALL_METHODS));
        rules.add(auth("emailOtp", "/api/user/two-factor", Set.of("PUT", "PATCH")));

        return Collections.unmodifiableList(rules);
    }

    private static SubFeatureDefinition sub(
            String parent,
            String subKey,
            List<String> feRoutes,
            List<String> bePaths) {
        return new SubFeatureDefinition(parent, subKey, feRoutes, bePaths);
    }

    private static WritePathRule write(
            String parent,
            String subKey,
            String pathPrefix,
            Set<String> httpMethods) {
        return new WritePathRule(parent, subKey, pathPrefix, httpMethods);
    }

    private static AuthOptInRule auth(String subKey, String pathPrefix, Set<String> httpMethods) {
        return new AuthOptInRule(subKey, pathPrefix, httpMethods);
    }
}
