package com.jaya.automation.api.contract;

import java.util.LinkedHashMap;
import java.util.Map;

public final class ApiEndpointRegistry {
    private final Map<String, ApiEndpointContract> contracts;

    public ApiEndpointRegistry() {
        this.contracts = defaultContracts();
    }

    public ApiEndpointContract require(String endpointKey) {
        ApiEndpointContract contract = contracts.get(endpointKey);
        if (contract == null) {
            throw new IllegalArgumentException("Unknown endpoint key: " + endpointKey);
        }
        return contract;
    }

    public boolean has(String endpointKey) {
        return contracts.containsKey(endpointKey);
    }

    public Map<String, ApiEndpointContract> all() {
        return Map.copyOf(contracts);
    }

    private Map<String, ApiEndpointContract> defaultContracts() {
        Map<String, ApiEndpointContract> defaults = new LinkedHashMap<>();
        register(defaults, "auth.signup", ApiHttpMethod.POST, "/auth/signup", false);
        register(defaults, "auth.signin", ApiHttpMethod.POST, "/auth/signin", false);
        register(defaults, "auth.verify-login-otp", ApiHttpMethod.POST, "/auth/verify-login-otp", false);
        register(defaults, "auth.verify-otp", ApiHttpMethod.POST, "/auth/verify-otp", false);
        register(defaults, "auth.refresh-token", ApiHttpMethod.POST, "/auth/refresh-token", false);
        register(defaults, "auth.check-method", ApiHttpMethod.GET, "/auth/check-auth-method", false);
        register(defaults, "auth.check-email", ApiHttpMethod.POST, "/auth/check-email", false);
        register(defaults, "auth.email", ApiHttpMethod.GET, "/auth/email", false);
        register(defaults, "auth.send-otp", ApiHttpMethod.POST, "/auth/send-otp", false);
        register(defaults, "auth.resend-login-otp", ApiHttpMethod.POST, "/auth/resend-login-otp", false);
        register(defaults, "auth.reset-password", ApiHttpMethod.PATCH, "/auth/reset-password", false);
        register(defaults, "auth.user-by-id", ApiHttpMethod.GET, "/auth/user/{userId}", false);
        register(defaults, "auth.user-by-id-short", ApiHttpMethod.GET, "/auth/{userId}", false);
        register(defaults, "auth.all-users", ApiHttpMethod.GET, "/auth/all-users", false);
        register(defaults, "auth.mfa.status", ApiHttpMethod.GET, "/auth/mfa/status", true);
        register(defaults, "auth.mfa.setup", ApiHttpMethod.POST, "/auth/mfa/setup", true);
        register(defaults, "auth.mfa.enable", ApiHttpMethod.POST, "/auth/mfa/enable", true);
        register(defaults, "auth.mfa.verify", ApiHttpMethod.POST, "/auth/mfa/verify", false);
        register(defaults, "auth.mfa.disable", ApiHttpMethod.POST, "/auth/mfa/disable", true);
        register(defaults, "auth.mfa.regenerate-backup-codes", ApiHttpMethod.POST, "/auth/mfa/regenerate-backup-codes", true);
        register(defaults, "auth.oauth2.google", ApiHttpMethod.POST, "/auth/oauth2/google", false);
        register(defaults, "auth.oauth2.health", ApiHttpMethod.GET, "/auth/oauth2/health", false);
        register(defaults, "user.profile", ApiHttpMethod.GET, "/api/user/profile", true);
        register(defaults, "user.by-email", ApiHttpMethod.GET, "/api/user/email", true);
        register(defaults, "user.all", ApiHttpMethod.GET, "/api/user/all", false);
        register(defaults, "user.by-id", ApiHttpMethod.GET, "/api/user/{id}", true);
        register(defaults, "user.update", ApiHttpMethod.PUT, "/api/user", true);
        register(defaults, "user.two-factor", ApiHttpMethod.PUT, "/api/user/two-factor", true);
        register(defaults, "user.delete", ApiHttpMethod.DELETE, "/api/user/{id}", true);
        register(defaults, "user.assign-role", ApiHttpMethod.POST, "/api/user/{userId}/roles/{roleId}", true);
        register(defaults, "user.remove-role", ApiHttpMethod.DELETE, "/api/user/{userId}/roles/{roleId}", true);
        register(defaults, "user.switch-mode", ApiHttpMethod.PUT, "/api/user/switch-mode", true);
        register(defaults, "roles.create", ApiHttpMethod.POST, "/api/roles", true);
        register(defaults, "roles.list", ApiHttpMethod.GET, "/api/roles", true);
        register(defaults, "roles.by-id", ApiHttpMethod.GET, "/api/roles/{id}", true);
        register(defaults, "roles.by-name", ApiHttpMethod.GET, "/api/roles/name/{name}", true);
        register(defaults, "roles.update", ApiHttpMethod.PUT, "/api/roles/{id}", true);
        register(defaults, "roles.delete", ApiHttpMethod.DELETE, "/api/roles/{id}", true);
        register(defaults, "admin.users.list", ApiHttpMethod.GET, "/api/admin/users", true);
        register(defaults, "admin.users.by-id", ApiHttpMethod.GET, "/api/admin/users/{userId}", true);
        register(defaults, "admin.users.status", ApiHttpMethod.PUT, "/api/admin/users/{userId}/status", true);
        register(defaults, "admin.users.delete", ApiHttpMethod.DELETE, "/api/admin/users/{userId}", true);
        register(defaults, "admin.users.bulk-action", ApiHttpMethod.POST, "/api/admin/users/bulk-action", true);
        register(defaults, "admin.users.stats", ApiHttpMethod.GET, "/api/admin/users/stats", true);
        register(defaults, "admin.users.search", ApiHttpMethod.GET, "/api/admin/users/search", true);
        register(defaults, "admin.all", ApiHttpMethod.GET, "/api/admin/all", true);
        register(defaults, "admin.analytics.overview", ApiHttpMethod.GET, "/api/admin/analytics/overview", true);
        register(defaults, "admin.analytics.top-categories", ApiHttpMethod.GET, "/api/admin/analytics/top-categories", true);
        register(defaults, "admin.analytics.recent-activity", ApiHttpMethod.GET, "/api/admin/analytics/recent-activity", true);
        register(defaults, "admin.analytics.top-users", ApiHttpMethod.GET, "/api/admin/analytics/top-users", true);
        register(defaults, "admin.analytics.user-stats", ApiHttpMethod.GET, "/api/admin/analytics/user-stats", true);
        register(defaults, "admin.analytics.dashboard", ApiHttpMethod.GET, "/api/admin/analytics/dashboard", true);
        register(defaults, "pref.dashboard.get", ApiHttpMethod.GET, "/api/user/dashboard-preferences", true);
        register(defaults, "pref.dashboard.save", ApiHttpMethod.POST, "/api/user/dashboard-preferences", true);
        register(defaults, "pref.dashboard.delete", ApiHttpMethod.DELETE, "/api/user/dashboard-preferences", true);
        register(defaults, "pref.expense.get", ApiHttpMethod.GET, "/api/user/expense-report-preferences", true);
        register(defaults, "pref.expense.save", ApiHttpMethod.POST, "/api/user/expense-report-preferences", true);
        register(defaults, "pref.expense.delete", ApiHttpMethod.DELETE, "/api/user/expense-report-preferences", true);
        register(defaults, "pref.category.get", ApiHttpMethod.GET, "/api/user/category-report-preferences", true);
        register(defaults, "pref.category.save", ApiHttpMethod.POST, "/api/user/category-report-preferences", true);
        register(defaults, "pref.category.delete", ApiHttpMethod.DELETE, "/api/user/category-report-preferences", true);
        register(defaults, "pref.payment.get", ApiHttpMethod.GET, "/api/user/payment-report-preferences", true);
        register(defaults, "pref.payment.save", ApiHttpMethod.POST, "/api/user/payment-report-preferences", true);
        register(defaults, "pref.payment.delete", ApiHttpMethod.DELETE, "/api/user/payment-report-preferences", true);
        register(defaults, "pref.friendship.get", ApiHttpMethod.GET, "/api/user/friendship-report-preferences", true);
        register(defaults, "pref.friendship.save", ApiHttpMethod.POST, "/api/user/friendship-report-preferences", true);
        register(defaults, "pref.friendship.delete", ApiHttpMethod.DELETE, "/api/user/friendship-report-preferences", true);
        register(defaults, "pref.budget.get", ApiHttpMethod.GET, "/api/user/budget-report-preferences", true);
        register(defaults, "pref.budget.save", ApiHttpMethod.POST, "/api/user/budget-report-preferences", true);
        register(defaults, "pref.budget.delete", ApiHttpMethod.DELETE, "/api/user/budget-report-preferences", true);
        register(defaults, "pref.bill.get", ApiHttpMethod.GET, "/api/user/bill-report-preferences", true);
        register(defaults, "pref.bill.save", ApiHttpMethod.POST, "/api/user/bill-report-preferences", true);
        register(defaults, "pref.bill.delete", ApiHttpMethod.DELETE, "/api/user/bill-report-preferences", true);
        register(defaults, "expenses.create", ApiHttpMethod.POST, "/api/expenses/add-expense", true);
        register(defaults, "expenses.copy", ApiHttpMethod.POST, "/api/expenses/{expenseId}/copy", true);
        register(defaults, "expenses.list", ApiHttpMethod.GET, "/api/expenses/fetch-expenses", true);
        register(defaults, "expenses.paginated", ApiHttpMethod.GET, "/api/expenses/fetch-expenses-paginated", true);
        register(defaults, "expenses.by-id", ApiHttpMethod.GET, "/api/expenses/expense/{id}", true);
        register(defaults, "expenses.detailed", ApiHttpMethod.GET, "/api/expenses/expense/{id}/detailed", true);
        register(defaults, "expenses.update", ApiHttpMethod.PUT, "/api/expenses/edit-expense/{id}", true);
        register(defaults, "expenses.delete", ApiHttpMethod.DELETE, "/api/expenses/delete/{id}", true);
        register(defaults, "expenses.search", ApiHttpMethod.GET, "/api/expenses/search", true);
        register(defaults, "expenses.summary", ApiHttpMethod.GET, "/api/expenses/summary-expenses", true);
        register(defaults, "expenses.payment-summary", ApiHttpMethod.GET, "/api/expenses/payment-method-summary", true);
        register(defaults, "expenses.monthly-summary", ApiHttpMethod.GET, "/api/expenses/monthly-summary/{year}/{month}", true);
        register(defaults, "expenses.yearly-summary", ApiHttpMethod.GET, "/api/expenses/yearly-summary/{year}", true);
        register(defaults, "expenses.bulk-add", ApiHttpMethod.POST, "/api/expenses/add-multiple", true);
        register(defaults, "expenses.bulk-add-tracked", ApiHttpMethod.POST, "/api/expenses/add-multiple/tracked", true);
        register(defaults, "expenses.bulk-progress", ApiHttpMethod.GET, "/api/expenses/add-multiple/progress/{jobId}", true);
        register(defaults, "bulk.expenses-budgets.create", ApiHttpMethod.POST, "/api/bulk/expenses-budgets", true);
        register(defaults, "bulk.expenses-budgets.tracked", ApiHttpMethod.POST, "/api/bulk/expenses-budgets/tracked", true);
        register(defaults, "bulk.expenses-budgets.progress", ApiHttpMethod.GET, "/api/bulk/expenses-budgets/progress/{jobId}", true);
        register(defaults, "budgets.create", ApiHttpMethod.POST, "/api/budgets", true);
        register(defaults, "budgets.list", ApiHttpMethod.GET, "/api/budgets", true);
        register(defaults, "budgets.by-id", ApiHttpMethod.GET, "/api/budgets/{budgetId}", true);
        register(defaults, "budgets.update", ApiHttpMethod.PUT, "/api/budgets/{budgetId}", true);
        register(defaults, "budgets.delete", ApiHttpMethod.DELETE, "/api/budgets/{budgetId}", true);
        register(defaults, "budgets.reports", ApiHttpMethod.GET, "/api/budgets/reports", true);
        register(defaults, "budgets.detailed-report", ApiHttpMethod.GET, "/api/budgets/detailed-report/{budgetId}", true);
        register(defaults, "budgets.search", ApiHttpMethod.GET, "/api/budgets/search", true);
        register(defaults, "friendships.request", ApiHttpMethod.POST, "/api/friendships/request", true);
        register(defaults, "friendships.respond", ApiHttpMethod.PUT, "/api/friendships/{friendshipId}/respond", true);
        register(defaults, "friendships.by-id", ApiHttpMethod.GET, "/api/friendships/{friendshipId}", true);
        register(defaults, "friendships.friends", ApiHttpMethod.GET, "/api/friendships/friends", true);
        register(defaults, "friendships.pending", ApiHttpMethod.GET, "/api/friendships/pending", true);
        register(defaults, "friendships.stats", ApiHttpMethod.GET, "/api/friendships/stats", true);
        register(defaults, "friendships.search", ApiHttpMethod.GET, "/api/friendships/search", true);
        register(defaults, "friendships.remove", ApiHttpMethod.DELETE, "/api/friendships/{friendshipId}", true);
        register(defaults, "friendships.block", ApiHttpMethod.POST, "/api/friendships/block/{userId}", true);
        register(defaults, "groups.create", ApiHttpMethod.POST, "/api/groups", true);
        register(defaults, "groups.list", ApiHttpMethod.GET, "/api/groups", true);
        register(defaults, "groups.by-id", ApiHttpMethod.GET, "/api/groups/{id}", true);
        register(defaults, "groups.update", ApiHttpMethod.PUT, "/api/groups/{id}", true);
        register(defaults, "groups.delete", ApiHttpMethod.DELETE, "/api/groups/{id}", true);
        register(defaults, "groups.members", ApiHttpMethod.GET, "/api/groups/{groupId}/members", true);
        register(defaults, "groups.invite", ApiHttpMethod.POST, "/api/groups/{groupId}/invite", true);
        register(defaults, "groups.search", ApiHttpMethod.GET, "/api/groups/search", true);
        register(defaults, "groups.settings.get", ApiHttpMethod.GET, "/api/groups/{groupId}/settings", true);
        register(defaults, "groups.settings.update", ApiHttpMethod.PUT, "/api/groups/{groupId}/settings", true);
        register(defaults, "shares.create", ApiHttpMethod.POST, "/api/shares", true);
        register(defaults, "shares.access", ApiHttpMethod.GET, "/api/shares/{token}", false);
        register(defaults, "shares.access-paginated", ApiHttpMethod.GET, "/api/shares/{token}/paginated", false);
        register(defaults, "shares.validate", ApiHttpMethod.GET, "/api/shares/{token}/validate", false);
        register(defaults, "shares.revoke", ApiHttpMethod.DELETE, "/api/shares/{token}", true);
        register(defaults, "shares.my", ApiHttpMethod.GET, "/api/shares/my-shares", true);
        register(defaults, "shares.shared-with-me", ApiHttpMethod.GET, "/api/shares/shared-with-me", true);
        register(defaults, "shares.public", ApiHttpMethod.GET, "/api/shares/public", false);
        register(defaults, "shares.toggle-save", ApiHttpMethod.POST, "/api/shares/{token}/toggle-save", true);
        register(defaults, "shares.make-public", ApiHttpMethod.PUT, "/api/shares/{token}/public", true);
        register(defaults, "events.create", ApiHttpMethod.POST, "/api/events", false);
        register(defaults, "events.list-user", ApiHttpMethod.GET, "/api/events/user/{userId}", false);
        register(defaults, "events.by-id", ApiHttpMethod.GET, "/api/events/{eventId}/user/{userId}", false);
        register(defaults, "events.update", ApiHttpMethod.PUT, "/api/events/{eventId}/user/{userId}", false);
        register(defaults, "events.delete", ApiHttpMethod.DELETE, "/api/events/{eventId}/user/{userId}", false);
        register(defaults, "events.summary", ApiHttpMethod.GET, "/api/events/{eventId}/summary/user/{userId}", false);
        register(defaults, "events.analytics", ApiHttpMethod.GET, "/api/events/{eventId}/analytics/user/{userId}", false);
        register(defaults, "chats.send-direct", ApiHttpMethod.POST, "/api/chats/one-to-one", true);
        register(defaults, "chats.send-group", ApiHttpMethod.POST, "/api/chats/group", true);
        register(defaults, "chats.list", ApiHttpMethod.GET, "/api/chats", true);
        register(defaults, "chats.between", ApiHttpMethod.GET, "/api/chats/between", true);
        register(defaults, "chats.mark-read", ApiHttpMethod.POST, "/api/chats/mark-read", true);
        register(defaults, "chats.unread-count", ApiHttpMethod.GET, "/api/chats/unread/count", true);
        register(defaults, "chats.conversations", ApiHttpMethod.GET, "/api/chats/conversations", true);
        register(defaults, "presence.user", ApiHttpMethod.GET, "/api/chats/presence/{userId}", true);
        register(defaults, "presence.friends", ApiHttpMethod.GET, "/api/chats/presence/friends", true);
        register(defaults, "presence.batch", ApiHttpMethod.GET, "/api/chats/presence/batch", true);
        register(defaults, "presence.heartbeat", ApiHttpMethod.POST, "/api/chats/presence/heartbeat", true);
        register(defaults, "presence.online", ApiHttpMethod.GET, "/api/chats/presence/online", true);
        return defaults;
    }

    private void register(
            Map<String, ApiEndpointContract> registry,
            String key,
            ApiHttpMethod method,
            String path,
            boolean requiresAuthorization
    ) {
        registry.put(key, new ApiEndpointContract(key, method, path, requiresAuthorization));
    }
}
