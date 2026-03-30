package com.jaya.automation.core.context;

import com.jaya.automation.core.config.AutomationConfig;
import com.jaya.automation.core.ui.UiEngine;

import java.util.Map;
import java.util.Optional;

/**
 * Per-scenario test context holding configuration, scenario state, UI engine,
 * and domain-specific convenience accessors backed by {@link ScenarioContext}.
 *
 * Pattern reference: company AbstractTaskDefinition / TestContext — typed
 * fields
 * for domain entities alongside a generic key-value store.
 */
public final class TestContext {
    private static final String KEY_USER_ID = "ctx.userId";
    private static final String KEY_EXPENSE_ID = "ctx.expenseId";
    private static final String KEY_BUDGET_ID = "ctx.budgetId";
    private static final String KEY_BILL_ID = "ctx.billId";
    private static final String KEY_CATEGORY_ID = "ctx.categoryId";
    private static final String KEY_PAYMENT_METHOD_ID = "ctx.paymentMethodId";
    private static final String KEY_FRIENDSHIP_ID = "ctx.friendshipId";
    private static final String KEY_GROUP_ID = "ctx.groupId";
    private static final String KEY_JWT_TOKEN = "ctx.jwtToken";
    private static final String KEY_ORDER_ACTION = "ctx.orderAction";
    private static final String KEY_SCENARIO = "ctx.scenario";
    private static final String KEY_API_RESPONSE = "ctx.apiResponse";
    private static final String KEY_REUSE_ID = "ctx.reuseId";

    private final AutomationConfig automationConfig;
    private final ScenarioContext scenarioContext;
    private UiEngine uiEngine;

    public TestContext(AutomationConfig automationConfig) {
        this.automationConfig = automationConfig;
        this.scenarioContext = new ScenarioContext();
    }

    public AutomationConfig automationConfig() {
        return automationConfig;
    }

    public ScenarioContext scenarioContext() {
        return scenarioContext;
    }

    public UiEngine uiEngine() {
        return uiEngine;
    }

    public void setUiEngine(UiEngine uiEngine) {
        this.uiEngine = uiEngine;
    }

    // ── Domain-specific convenience accessors (backed by ScenarioContext) ──

    public void setUserId(String userId) {
        scenarioContext.put(KEY_USER_ID, userId);
    }

    public String userId() {
        return stringValue(KEY_USER_ID);
    }

    public void setExpenseId(String expenseId) {
        scenarioContext.put(KEY_EXPENSE_ID, expenseId);
    }

    public String expenseId() {
        return stringValue(KEY_EXPENSE_ID);
    }

    public void setBudgetId(String budgetId) {
        scenarioContext.put(KEY_BUDGET_ID, budgetId);
    }

    public String budgetId() {
        return stringValue(KEY_BUDGET_ID);
    }

    public void setBillId(String billId) {
        scenarioContext.put(KEY_BILL_ID, billId);
    }

    public String billId() {
        return stringValue(KEY_BILL_ID);
    }

    public void setCategoryId(String categoryId) {
        scenarioContext.put(KEY_CATEGORY_ID, categoryId);
    }

    public String categoryId() {
        return stringValue(KEY_CATEGORY_ID);
    }

    public void setPaymentMethodId(String paymentMethodId) {
        scenarioContext.put(KEY_PAYMENT_METHOD_ID, paymentMethodId);
    }

    public String paymentMethodId() {
        return stringValue(KEY_PAYMENT_METHOD_ID);
    }

    public void setFriendshipId(String friendshipId) {
        scenarioContext.put(KEY_FRIENDSHIP_ID, friendshipId);
    }

    public String friendshipId() {
        return stringValue(KEY_FRIENDSHIP_ID);
    }

    public void setGroupId(String groupId) {
        scenarioContext.put(KEY_GROUP_ID, groupId);
    }

    public String groupId() {
        return stringValue(KEY_GROUP_ID);
    }

    public void setJwtToken(String jwtToken) {
        scenarioContext.put(KEY_JWT_TOKEN, jwtToken);
    }

    public String jwtToken() {
        return stringValue(KEY_JWT_TOKEN);
    }

    public void setOrderAction(String orderAction) {
        scenarioContext.put(KEY_ORDER_ACTION, orderAction);
    }

    public String orderAction() {
        return stringValue(KEY_ORDER_ACTION);
    }

    public void setScenario(String scenario) {
        scenarioContext.put(KEY_SCENARIO, scenario);
    }

    public String scenario() {
        return stringValue(KEY_SCENARIO);
    }

    public void setApiResponse(Object apiResponse) {
        scenarioContext.put(KEY_API_RESPONSE, apiResponse);
    }

    public Object apiResponse() {
        return scenarioContext.get(KEY_API_RESPONSE, Object.class).orElse(null);
    }

    public void setReuseId(String reuseId) {
        scenarioContext.put(KEY_REUSE_ID, reuseId);
    }

    public String reuseId() {
        return stringValue(KEY_REUSE_ID);
    }

    /**
     * Bulk-set context values from a DataTable column map.
     * Keys are mapped to domain fields where recognized, remainder stored as-is.
     */
    public void applyDataTableColumns(Map<String, String> columns) {
        columns.forEach((key, value) -> {
            if (value == null || value.isBlank()) {
                return;
            }
            switch (key) {
                case "userId" -> setUserId(value);
                case "expenseId" -> setExpenseId(value);
                case "budgetId" -> setBudgetId(value);
                case "billId" -> setBillId(value);
                case "categoryId" -> setCategoryId(value);
                case "paymentMethodId" -> setPaymentMethodId(value);
                case "friendshipId" -> setFriendshipId(value);
                case "groupId" -> setGroupId(value);
                case "jwtToken" -> setJwtToken(value);
                case "orderAction" -> setOrderAction(value);
                case "scenario" -> setScenario(value);
                case "reuseId" -> setReuseId(value);
                default -> scenarioContext.put(key, value);
            }
        });
    }

    /**
     * Copy reusable state from another TestContext (for REUSE_ID flows).
     */
    public void copyFrom(TestContext source) {
        source.scenarioContext().snapshot().forEach((key, value) -> scenarioContext.put(key, value));
    }

    private String stringValue(String key) {
        return scenarioContext.get(key, String.class).orElse(null);
    }
}
