package com.jaya.automation.bdd.context;

import com.jaya.automation.api.client.AuthApiClient;
import com.jaya.automation.api.client.BudgetApiClient;
import com.jaya.automation.api.client.ChatApiClient;
import com.jaya.automation.api.client.EventApiClient;
import com.jaya.automation.api.client.ExpenseApiClient;
import com.jaya.automation.api.client.FriendshipApiClient;
import com.jaya.automation.api.client.GroupApiClient;
import com.jaya.automation.api.client.PresenceApiClient;
import com.jaya.automation.api.client.SharingApiClient;
import com.jaya.automation.api.client.UserProfileApiClient;
import com.jaya.automation.api.contract.ApiEndpointRegistry;
import com.jaya.automation.api.execution.ApiExecutionResult;
import com.jaya.automation.api.execution.ApiRequestExecutor;
import com.jaya.automation.api.model.AuthSigninResponse;
import com.jaya.automation.api.model.UserProfileResponse;
import com.jaya.automation.api.util.JsonSchemaValidator;
import com.jaya.automation.api.util.SessionTokenHelper;
import com.jaya.automation.api.util.TokenProvider;
import com.jaya.automation.api.validator.ApiResponseValidator;
import com.jaya.automation.core.config.AutomationConfig;
import com.jaya.automation.core.context.TestContext;
import com.jaya.automation.flows.auth.service.AuthUiFlowService;
import com.jaya.automation.flows.common.service.DomainNavigationFlowService;
import com.jaya.automation.flows.common.service.UiActionExecutor;

import java.util.Map;
import java.util.Optional;

public final class BddWorld {
    private static final ThreadLocal<AutomationConfig> CONFIG = new ThreadLocal<>();
    private static final ThreadLocal<TestContext> TEST_CONTEXT = new ThreadLocal<>();
    private static final ThreadLocal<ScenarioState> SCENARIO_STATE = new ThreadLocal<>();
    private static final ThreadLocal<SuiteDataCatalog> SUITE_DATA_CATALOG = new ThreadLocal<>();
    private static final ThreadLocal<ScenarioDataBinder> SCENARIO_DATA_BINDER = new ThreadLocal<>();
    private static final ThreadLocal<ApiScenarioContext> API_SCENARIO_CONTEXT = new ThreadLocal<>();
    private static final ThreadLocal<ApiEndpointRegistry> API_ENDPOINT_REGISTRY = new ThreadLocal<>();
    private static final ThreadLocal<ApiRequestExecutor> API_REQUEST_EXECUTOR = new ThreadLocal<>();
    private static final ThreadLocal<ApiResponseValidator> API_RESPONSE_VALIDATOR = new ThreadLocal<>();
    private static final ThreadLocal<JsonSchemaValidator> JSON_SCHEMA_VALIDATOR = new ThreadLocal<>();
    private static final ThreadLocal<ApiExecutionResult> API_EXECUTION_RESULT = new ThreadLocal<>();
    private static final ThreadLocal<UiActionExecutor> UI_ACTION_EXECUTOR = new ThreadLocal<>();
    private static final ThreadLocal<AuthUiFlowService> AUTH_UI_FLOW_SERVICE = new ThreadLocal<>();
    private static final ThreadLocal<AuthApiClient> AUTH_API_CLIENT = new ThreadLocal<>();
    private static final ThreadLocal<UserProfileApiClient> USER_PROFILE_API_CLIENT = new ThreadLocal<>();
    private static final ThreadLocal<ExpenseApiClient> EXPENSE_API_CLIENT = new ThreadLocal<>();
    private static final ThreadLocal<BudgetApiClient> BUDGET_API_CLIENT = new ThreadLocal<>();
    private static final ThreadLocal<FriendshipApiClient> FRIENDSHIP_API_CLIENT = new ThreadLocal<>();
    private static final ThreadLocal<GroupApiClient> GROUP_API_CLIENT = new ThreadLocal<>();
    private static final ThreadLocal<SharingApiClient> SHARING_API_CLIENT = new ThreadLocal<>();
    private static final ThreadLocal<EventApiClient> EVENT_API_CLIENT = new ThreadLocal<>();
    private static final ThreadLocal<ChatApiClient> CHAT_API_CLIENT = new ThreadLocal<>();
    private static final ThreadLocal<PresenceApiClient> PRESENCE_API_CLIENT = new ThreadLocal<>();
    private static final ThreadLocal<SessionTokenHelper> SESSION_TOKEN_HELPER = new ThreadLocal<>();
    private static final ThreadLocal<TokenProvider> TOKEN_PROVIDER = new ThreadLocal<>();
    private static final ThreadLocal<DomainNavigationFlowService> DOMAIN_NAVIGATION_FLOW = new ThreadLocal<>();
    private static final ThreadLocal<AuthSigninResponse> SIGNIN_RESPONSE = new ThreadLocal<>();
    private static final ThreadLocal<UserProfileResponse> PROFILE_RESPONSE = new ThreadLocal<>();
    private static final ThreadLocal<String> JWT_TOKEN = new ThreadLocal<>();
    private static final ThreadLocal<String> CURRENT_URL = new ThreadLocal<>();
    private static final ThreadLocal<String> ERROR_MESSAGE = new ThreadLocal<>();
    private static final ThreadLocal<Map<String, String>> DATA_ROW = new ThreadLocal<>();

    private BddWorld() {
    }

    public static void init(AutomationConfig automationConfig) {
        CONFIG.set(automationConfig);
        TestContext testContext = new TestContext(automationConfig);
        TEST_CONTEXT.set(testContext);
        SCENARIO_STATE.set(new ScenarioState(testContext.scenarioContext()));
    }

    public static AutomationConfig config() {
        return require(CONFIG, "AutomationConfig");
    }

    public static TestContext testContext() {
        return require(TEST_CONTEXT, "TestContext");
    }

    public static ScenarioState scenarioState() {
        return require(SCENARIO_STATE, "ScenarioState");
    }

    public static void setSuiteDataCatalog(SuiteDataCatalog suiteDataCatalog) {
        SUITE_DATA_CATALOG.set(suiteDataCatalog);
    }

    public static SuiteDataCatalog suiteDataCatalog() {
        return require(SUITE_DATA_CATALOG, "SuiteDataCatalog");
    }

    public static void setScenarioDataBinder(ScenarioDataBinder scenarioDataBinder) {
        SCENARIO_DATA_BINDER.set(scenarioDataBinder);
    }

    public static ScenarioDataBinder scenarioDataBinder() {
        return require(SCENARIO_DATA_BINDER, "ScenarioDataBinder");
    }

    public static void setApiScenarioContext(ApiScenarioContext apiScenarioContext) {
        API_SCENARIO_CONTEXT.set(apiScenarioContext);
    }

    public static ApiScenarioContext apiScenarioContext() {
        return require(API_SCENARIO_CONTEXT, "ApiScenarioContext");
    }

    public static void setApiEndpointRegistry(ApiEndpointRegistry endpointRegistry) {
        API_ENDPOINT_REGISTRY.set(endpointRegistry);
    }

    public static ApiEndpointRegistry apiEndpointRegistry() {
        return require(API_ENDPOINT_REGISTRY, "ApiEndpointRegistry");
    }

    public static void setApiRequestExecutor(ApiRequestExecutor apiRequestExecutor) {
        API_REQUEST_EXECUTOR.set(apiRequestExecutor);
    }

    public static ApiRequestExecutor apiRequestExecutor() {
        return require(API_REQUEST_EXECUTOR, "ApiRequestExecutor");
    }

    public static void setApiResponseValidator(ApiResponseValidator apiResponseValidator) {
        API_RESPONSE_VALIDATOR.set(apiResponseValidator);
    }

    public static ApiResponseValidator apiResponseValidator() {
        return require(API_RESPONSE_VALIDATOR, "ApiResponseValidator");
    }

    public static void setJsonSchemaValidator(JsonSchemaValidator jsonSchemaValidator) {
        JSON_SCHEMA_VALIDATOR.set(jsonSchemaValidator);
    }

    public static JsonSchemaValidator jsonSchemaValidator() {
        return require(JSON_SCHEMA_VALIDATOR, "JsonSchemaValidator");
    }

    public static void setApiExecutionResult(ApiExecutionResult apiExecutionResult) {
        API_EXECUTION_RESULT.set(apiExecutionResult);
    }

    public static ApiExecutionResult apiExecutionResult() {
        return require(API_EXECUTION_RESULT, "ApiExecutionResult");
    }

    public static void setUiActionExecutor(UiActionExecutor uiActionExecutor) {
        UI_ACTION_EXECUTOR.set(uiActionExecutor);
    }

    public static UiActionExecutor uiActionExecutor() {
        return require(UI_ACTION_EXECUTOR, "UiActionExecutor");
    }

    public static void setAuthUiFlowService(AuthUiFlowService service) {
        AUTH_UI_FLOW_SERVICE.set(service);
    }

    public static AuthUiFlowService authUiFlowService() {
        return require(AUTH_UI_FLOW_SERVICE, "AuthUiFlowService");
    }

    public static void setAuthApiClient(AuthApiClient client) {
        AUTH_API_CLIENT.set(client);
    }

    public static AuthApiClient authApiClient() {
        return require(AUTH_API_CLIENT, "AuthApiClient");
    }

    public static void setUserProfileApiClient(UserProfileApiClient client) {
        USER_PROFILE_API_CLIENT.set(client);
    }

    public static UserProfileApiClient userProfileApiClient() {
        return require(USER_PROFILE_API_CLIENT, "UserProfileApiClient");
    }

    public static void setExpenseApiClient(ExpenseApiClient client) {
        EXPENSE_API_CLIENT.set(client);
    }

    public static ExpenseApiClient expenseApiClient() {
        return require(EXPENSE_API_CLIENT, "ExpenseApiClient");
    }

    public static void setBudgetApiClient(BudgetApiClient client) {
        BUDGET_API_CLIENT.set(client);
    }

    public static BudgetApiClient budgetApiClient() {
        return require(BUDGET_API_CLIENT, "BudgetApiClient");
    }

    public static void setFriendshipApiClient(FriendshipApiClient client) {
        FRIENDSHIP_API_CLIENT.set(client);
    }

    public static FriendshipApiClient friendshipApiClient() {
        return require(FRIENDSHIP_API_CLIENT, "FriendshipApiClient");
    }

    public static void setGroupApiClient(GroupApiClient client) {
        GROUP_API_CLIENT.set(client);
    }

    public static GroupApiClient groupApiClient() {
        return require(GROUP_API_CLIENT, "GroupApiClient");
    }

    public static void setSharingApiClient(SharingApiClient client) {
        SHARING_API_CLIENT.set(client);
    }

    public static SharingApiClient sharingApiClient() {
        return require(SHARING_API_CLIENT, "SharingApiClient");
    }

    public static void setEventApiClient(EventApiClient client) {
        EVENT_API_CLIENT.set(client);
    }

    public static EventApiClient eventApiClient() {
        return require(EVENT_API_CLIENT, "EventApiClient");
    }

    public static void setChatApiClient(ChatApiClient client) {
        CHAT_API_CLIENT.set(client);
    }

    public static ChatApiClient chatApiClient() {
        return require(CHAT_API_CLIENT, "ChatApiClient");
    }

    public static void setPresenceApiClient(PresenceApiClient client) {
        PRESENCE_API_CLIENT.set(client);
    }

    public static PresenceApiClient presenceApiClient() {
        return require(PRESENCE_API_CLIENT, "PresenceApiClient");
    }

    public static void setSessionTokenHelper(SessionTokenHelper helper) {
        SESSION_TOKEN_HELPER.set(helper);
    }

    public static SessionTokenHelper sessionTokenHelper() {
        return require(SESSION_TOKEN_HELPER, "SessionTokenHelper");
    }

    public static void setTokenProvider(TokenProvider tokenProvider) {
        TOKEN_PROVIDER.set(tokenProvider);
    }

    public static TokenProvider tokenProvider() {
        return require(TOKEN_PROVIDER, "TokenProvider");
    }

    public static void setDomainNavigationFlow(DomainNavigationFlowService flowService) {
        DOMAIN_NAVIGATION_FLOW.set(flowService);
    }

    public static DomainNavigationFlowService domainNavigationFlow() {
        return require(DOMAIN_NAVIGATION_FLOW, "DomainNavigationFlowService");
    }

    public static void setSigninResponse(AuthSigninResponse response) {
        SIGNIN_RESPONSE.set(response);
        scenarioState().putResponseAlias("signin", response);
    }

    public static AuthSigninResponse signinResponse() {
        return require(SIGNIN_RESPONSE, "AuthSigninResponse");
    }

    public static void setProfileResponse(UserProfileResponse response) {
        PROFILE_RESPONSE.set(response);
        scenarioState().putResponseAlias("profile", response);
    }

    public static UserProfileResponse profileResponse() {
        return require(PROFILE_RESPONSE, "UserProfileResponse");
    }

    public static void setJwtToken(String jwtToken) {
        JWT_TOKEN.set(jwtToken);
        scenarioState().putSessionValue("jwt", jwtToken);
    }

    public static String jwtToken() {
        String jwtToken = JWT_TOKEN.get();
        if (jwtToken != null) {
            return jwtToken;
        }
        return scenarioState().sessionValue("jwt")
                .orElseThrow(() -> new IllegalStateException("JwtToken is not initialized"));
    }

    public static void setCurrentUrl(String currentUrl) {
        CURRENT_URL.set(currentUrl);
        scenarioState().putUiValue("currentPageUrl", currentUrl);
    }

    public static String currentUrl() {
        String currentUrl = CURRENT_URL.get();
        if (currentUrl != null) {
            return currentUrl;
        }
        return scenarioState().uiValue("currentPageUrl")
                .orElseThrow(() -> new IllegalStateException("CurrentUrl is not initialized"));
    }

    public static void setErrorMessage(String errorMessage) {
        ERROR_MESSAGE.set(errorMessage);
        scenarioState().putUiValue("lastErrorMessage", errorMessage);
    }

    public static String errorMessage() {
        String errorMessage = ERROR_MESSAGE.get();
        if (errorMessage != null) {
            return errorMessage;
        }
        return scenarioState().uiValue("lastErrorMessage")
                .orElseThrow(() -> new IllegalStateException("ErrorMessage is not initialized"));
    }

    public static void setDataRow(Map<String, String> dataRow) {
        DATA_ROW.set(dataRow);
        scenarioState().setDataRow(dataRow);
    }

    public static Map<String, String> dataRow() {
        Map<String, String> values = DATA_ROW.get();
        return values == null ? scenarioState().dataRow() : values;
    }

    public static void putRequestAlias(String alias, Map<String, Object> payload) {
        scenarioState().putRequestAlias(alias, payload);
    }

    public static void putResponseAlias(String alias, Object value) {
        scenarioState().putResponseAlias(alias, value);
    }

    public static void putSessionValue(String key, String value) {
        scenarioState().putSessionValue(key, value);
    }

    public static void putUiValue(String key, String value) {
        scenarioState().putUiValue(key, value);
    }

    public static void putAliasValue(String alias, Object value) {
        scenarioState().putAlias(alias, value);
    }

    public static Optional<Object> aliasValue(String alias) {
        return scenarioState().aliasValue(alias);
    }

    public static void clear() {
        CONFIG.remove();
        TEST_CONTEXT.remove();
        SCENARIO_STATE.remove();
        SUITE_DATA_CATALOG.remove();
        SCENARIO_DATA_BINDER.remove();
        API_SCENARIO_CONTEXT.remove();
        API_ENDPOINT_REGISTRY.remove();
        API_REQUEST_EXECUTOR.remove();
        API_RESPONSE_VALIDATOR.remove();
        JSON_SCHEMA_VALIDATOR.remove();
        API_EXECUTION_RESULT.remove();
        UI_ACTION_EXECUTOR.remove();
        AUTH_UI_FLOW_SERVICE.remove();
        AUTH_API_CLIENT.remove();
        USER_PROFILE_API_CLIENT.remove();
        EXPENSE_API_CLIENT.remove();
        BUDGET_API_CLIENT.remove();
        FRIENDSHIP_API_CLIENT.remove();
        GROUP_API_CLIENT.remove();
        SHARING_API_CLIENT.remove();
        EVENT_API_CLIENT.remove();
        CHAT_API_CLIENT.remove();
        PRESENCE_API_CLIENT.remove();
        SESSION_TOKEN_HELPER.remove();
        TOKEN_PROVIDER.remove();
        DOMAIN_NAVIGATION_FLOW.remove();
        SIGNIN_RESPONSE.remove();
        PROFILE_RESPONSE.remove();
        JWT_TOKEN.remove();
        CURRENT_URL.remove();
        ERROR_MESSAGE.remove();
        DATA_ROW.remove();
    }

    private static <T> T require(ThreadLocal<T> holder, String name) {
        T value = holder.get();
        if (value == null) {
            throw new IllegalStateException(name + " is not initialized");
        }
        return value;
    }
}
