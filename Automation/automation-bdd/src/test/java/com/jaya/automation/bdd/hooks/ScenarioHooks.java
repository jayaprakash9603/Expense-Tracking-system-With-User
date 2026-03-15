package com.jaya.automation.bdd.hooks;

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
import com.jaya.automation.api.execution.ApiRequestExecutor;
import com.jaya.automation.api.util.DefaultTokenProvider;
import com.jaya.automation.api.util.JsonSchemaValidator;
import com.jaya.automation.api.util.SessionTokenHelper;
import com.jaya.automation.api.validator.ApiResponseValidator;
import com.jaya.automation.bdd.context.ApiScenarioContext;
import com.jaya.automation.bdd.context.AuthProviderFactory;
import com.jaya.automation.bdd.context.BddWorld;
import com.jaya.automation.bdd.context.DependencyGuard;
import com.jaya.automation.bdd.context.ScenarioDataBinder;
import com.jaya.automation.bdd.context.SuiteDataCatalog;
import com.jaya.automation.bdd.context.UiEngineFactory;
import com.jaya.automation.bdd.runner.StepExecutionLoggerPlugin;
import com.jaya.automation.core.config.AutomationConfig;
import com.jaya.automation.core.config.ConfigLoader;
import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;
import com.jaya.automation.core.ui.UiEngine;
import com.jaya.automation.data.excel.ExcelDatasetResolver;
import com.jaya.automation.flows.auth.service.AuthUiFlowService;
import com.jaya.automation.flows.common.service.DomainNavigationFlowService;
import com.jaya.automation.flows.common.service.UiActionExecutor;
import io.cucumber.java.After;
import io.cucumber.java.AfterAll;
import io.cucumber.java.Before;
import io.cucumber.java.BeforeAll;
import io.cucumber.java.Scenario;
import org.testng.SkipException;

import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.Set;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class ScenarioHooks {
    private static final AutomationLogger LOG = LoggerFactory.getLogger(ScenarioHooks.class);
    private static final ThreadLocal<UiEngine> SHARED_UI_ENGINE = new ThreadLocal<>();
    private static final Set<UiEngine> SHARED_ENGINES = ConcurrentHashMap.newKeySet();
    private static final Map<String, Boolean> REACHABILITY_CACHE = new ConcurrentHashMap<>();
    private static final Object PREWARM_LOCK = new Object();
    private static final Object API_INIT_LOCK = new Object();
    private static final Object DATA_CATALOG_LOCK = new Object();
    private static volatile UiEngine PREWARMED_SINGLE_THREAD_UI_ENGINE;
    private static volatile String PREWARMED_CONFIG_KEY = "";
    private static volatile boolean PREWARM_COMPLETED;
    private static volatile SharedApiDependencies SHARED_API_DEPENDENCIES;
    private static volatile String SHARED_API_CONFIG_KEY = "";
    private static volatile SuiteDataCatalog SHARED_SUITE_DATA_CATALOG;
    private static volatile String SHARED_DATA_CONFIG_KEY = "";
    private final DependencyGuard dependencyGuard = new DependencyGuard();
    private final ExcelDatasetResolver excelDatasetResolver = new ExcelDatasetResolver();

    @BeforeAll
    public static void beforeAll() {
        prewarmSuiteDependencies(ConfigLoader.load());
    }

    @Before(order = 0)
    public void beforeScenario(Scenario scenario) {
        AutomationConfig config = ConfigLoader.load();
        prewarmSuiteDependencies(config);
        BddWorld.init(config);
        initializeScenarioData(config, scenario);
        dependencyGuard.requireDatasetIfConfigured(config);
        initializeApiClients(config);
        Collection<String> tags = scenario.getSourceTagNames();
        BddWorld.putAliasValue("scenario.name", scenario.getName());
        BddWorld.putAliasValue("scenario.tags", String.join(",", tags));
        if (tags.contains("@template")) {
            throw new SkipException("Template scenario is documentation-only");
        }

        if (tags.contains("@requiresCredentials")) {
            dependencyGuard.requireCredentials(config);
        }
        if (tags.contains("@api")) {
            requireReachableOnce("API_BASE_URL", config.apiBaseUrl());
        }
        if (tags.contains("@ui")) {
            requireReachableOnce("BASE_URL", config.baseUrl());
            initializeUiFlow(config);
        }
    }

    @After(order = 0)
    public void afterScenario(Scenario scenario) {
        try {
            attachStepExecutionLog(scenario);
            captureFailureScreenshot(scenario);
        } finally {
            stopUiEngine();
            BddWorld.clear();
        }
    }

    private void initializeApiClients(AutomationConfig config) {
        SharedApiDependencies dependencies = resolveSharedApiDependencies(config);
        dependencies.bind();
        BddWorld.setApiScenarioContext(new ApiScenarioContext(BddWorld.scenarioState()));
    }

    private void initializeUiFlow(AutomationConfig config) {
        UiEngine uiEngine = resolveUiEngine(config);
        BddWorld.testContext().setUiEngine(uiEngine);
        AuthUiFlowService authFlow = new AuthUiFlowService(
                uiEngine,
                AuthProviderFactory.otpProvider(config),
                AuthProviderFactory.mfaProvider(config)
        );
        BddWorld.setAuthUiFlowService(authFlow);
        DomainNavigationFlowService domainNavigationFlowService = new DomainNavigationFlowService(uiEngine);
        BddWorld.setDomainNavigationFlow(domainNavigationFlowService);
        BddWorld.setUiActionExecutor(new UiActionExecutor(uiEngine, domainNavigationFlowService));
    }

    private UiEngine resolveUiEngine(AutomationConfig config) {
        if (!config.runnerSettings().reuseBrowserSession()) {
            UiEngine uiEngine = UiEngineFactory.create(config);
            uiEngine.start();
            return uiEngine;
        }
        if (config.parallelThreads() == 1 && PREWARMED_SINGLE_THREAD_UI_ENGINE != null) {
            SHARED_UI_ENGINE.set(PREWARMED_SINGLE_THREAD_UI_ENGINE);
            SHARED_ENGINES.add(PREWARMED_SINGLE_THREAD_UI_ENGINE);
            return PREWARMED_SINGLE_THREAD_UI_ENGINE;
        }
        UiEngine sharedUiEngine = SHARED_UI_ENGINE.get();
        if (sharedUiEngine != null) {
            return sharedUiEngine;
        }
        UiEngine uiEngine = UiEngineFactory.create(config);
        uiEngine.start();
        SHARED_UI_ENGINE.set(uiEngine);
        SHARED_ENGINES.add(uiEngine);
        return uiEngine;
    }

    private void captureFailureScreenshot(Scenario scenario) {
        UiEngine uiEngine = BddWorld.testContext().uiEngine();
        if (uiEngine == null) {
            return;
        }
        boolean shouldCapture = scenario.isFailed() || BddWorld.config().artifactSettings().screenshotAlways();
        if (!shouldCapture) {
            return;
        }
        try {
            Path screenshotPath = uiEngine.screenshots().capture(scenario.getName());
            byte[] screenshot = Files.readAllBytes(screenshotPath);
            scenario.attach(screenshot, "image/png", "failure-screenshot");
        } catch (Exception ex) {
            LOG.warn("Unable to capture screenshot for scenario '{}': {}", scenario.getName(), ex.getMessage());
        }
    }

    private void attachStepExecutionLog(Scenario scenario) {
        String logContent = StepExecutionLoggerPlugin.currentStepLog();
        if (logContent.isBlank()) {
            return;
        }
        String status = scenario.isFailed() ? "FAILED" : "PASSED";
        String summary = "SCENARIO " + status + ": " + scenario.getName();
        String payload = logContent + System.lineSeparator() + summary;
        scenario.attach(payload.getBytes(StandardCharsets.UTF_8), "text/plain", "step-execution-log");
    }

    private void stopUiEngine() {
        UiEngine uiEngine = BddWorld.testContext().uiEngine();
        if (uiEngine != null) {
            if (BddWorld.config().runnerSettings().reuseBrowserSession()) {
                return;
            }
            uiEngine.stop();
        }
    }

    @AfterAll
    public static void stopSharedUiEngines() {
        for (UiEngine uiEngine : SHARED_ENGINES) {
            try {
                uiEngine.stop();
            } catch (Exception ignored) {
            }
        }
        SHARED_ENGINES.clear();
        SHARED_UI_ENGINE.remove();
        PREWARMED_SINGLE_THREAD_UI_ENGINE = null;
        PREWARMED_CONFIG_KEY = "";
        PREWARM_COMPLETED = false;
    }

    private void initializeScenarioData(AutomationConfig config, Scenario scenario) {
        SuiteDataCatalog suiteDataCatalog = resolveSharedSuiteDataCatalog(config);
        BddWorld.setSuiteDataCatalog(suiteDataCatalog);
        ScenarioDataBinder scenarioDataBinder = new ScenarioDataBinder(suiteDataCatalog);
        BddWorld.setScenarioDataBinder(scenarioDataBinder);
        Map<String, String> dataRow = loadDataRow(config, scenario.getName());
        Map<String, String> resolvedDataRow = scenarioDataBinder.resolveMap(dataRow);
        BddWorld.setDataRow(resolvedDataRow);
        resolvedDataRow.forEach(BddWorld::putAliasValue);
    }

    private Map<String, String> loadDataRow(AutomationConfig config, String scenarioName) {
        if (!config.hasDataset()) {
            return Map.of();
        }
        return excelDatasetResolver.resolveScenarioData(config.dataSettings(), scenarioName);
    }

    private void requireReachableOnce(String endpointName, String url) {
        String cacheKey = endpointName + "|" + url;
        if (REACHABILITY_CACHE.containsKey(cacheKey)) {
            return;
        }
        dependencyGuard.requireReachable(endpointName, url);
        REACHABILITY_CACHE.put(cacheKey, Boolean.TRUE);
    }

    private SharedApiDependencies resolveSharedApiDependencies(AutomationConfig config) {
        String configKey = configKey(config);
        SharedApiDependencies dependencies = SHARED_API_DEPENDENCIES;
        if (dependencies != null && configKey.equals(SHARED_API_CONFIG_KEY)) {
            return dependencies;
        }
        synchronized (API_INIT_LOCK) {
            if (SHARED_API_DEPENDENCIES != null && configKey.equals(SHARED_API_CONFIG_KEY)) {
                return SHARED_API_DEPENDENCIES;
            }
            SHARED_API_DEPENDENCIES = buildSharedApiDependencies(config);
            SHARED_API_CONFIG_KEY = configKey;
            return SHARED_API_DEPENDENCIES;
        }
    }

    private SharedApiDependencies buildSharedApiDependencies(AutomationConfig config) {
        AuthApiClient authApiClient = new AuthApiClient(config);
        UserProfileApiClient userProfileApiClient = new UserProfileApiClient(config);
        ExpenseApiClient expenseApiClient = new ExpenseApiClient(config);
        BudgetApiClient budgetApiClient = new BudgetApiClient(config);
        FriendshipApiClient friendshipApiClient = new FriendshipApiClient(config);
        GroupApiClient groupApiClient = new GroupApiClient(config);
        SharingApiClient sharingApiClient = new SharingApiClient(config);
        EventApiClient eventApiClient = new EventApiClient(config);
        ChatApiClient chatApiClient = new ChatApiClient(config);
        PresenceApiClient presenceApiClient = new PresenceApiClient(config);
        SessionTokenHelper sessionTokenHelper = new SessionTokenHelper(config, authApiClient);
        ApiEndpointRegistry endpointRegistry = new ApiEndpointRegistry();
        ApiRequestExecutor apiRequestExecutor = new ApiRequestExecutor(config, endpointRegistry);
        DefaultTokenProvider tokenProvider = new DefaultTokenProvider(config, sessionTokenHelper);
        ApiResponseValidator apiResponseValidator = new ApiResponseValidator();
        JsonSchemaValidator jsonSchemaValidator = new JsonSchemaValidator();
        return new SharedApiDependencies(
                authApiClient,
                userProfileApiClient,
                expenseApiClient,
                budgetApiClient,
                friendshipApiClient,
                groupApiClient,
                sharingApiClient,
                eventApiClient,
                chatApiClient,
                presenceApiClient,
                sessionTokenHelper,
                tokenProvider,
                endpointRegistry,
                apiRequestExecutor,
                apiResponseValidator,
                jsonSchemaValidator
        );
    }

    private SuiteDataCatalog resolveSharedSuiteDataCatalog(AutomationConfig config) {
        if (!config.hasDataset()) {
            return new SuiteDataCatalog(config);
        }
        String configKey = configKey(config);
        SuiteDataCatalog suiteDataCatalog = SHARED_SUITE_DATA_CATALOG;
        if (suiteDataCatalog != null && configKey.equals(SHARED_DATA_CONFIG_KEY)) {
            return suiteDataCatalog;
        }
        synchronized (DATA_CATALOG_LOCK) {
            if (SHARED_SUITE_DATA_CATALOG != null && configKey.equals(SHARED_DATA_CONFIG_KEY)) {
                return SHARED_SUITE_DATA_CATALOG;
            }
            SHARED_SUITE_DATA_CATALOG = new SuiteDataCatalog(config);
            SHARED_DATA_CONFIG_KEY = configKey;
            return SHARED_SUITE_DATA_CATALOG;
        }
    }

    private String configKey(AutomationConfig config) {
        return String.join(
                "|",
                config.environmentType().name(),
                config.baseUrl(),
                config.apiBaseUrl(),
                config.automationEngine().name(),
                config.browserType().name(),
                String.valueOf(config.headless()),
                String.valueOf(config.parallelThreads())
        );
    }

    private static void prewarmSuiteDependencies(AutomationConfig config) {
        String prewarmConfigKey = String.join(
                "|",
                config.environmentType().name(),
                config.baseUrl(),
                config.apiBaseUrl(),
                config.automationEngine().name(),
                config.browserType().name(),
                String.valueOf(config.headless()),
                String.valueOf(config.parallelThreads()),
                String.valueOf(config.runnerSettings().reuseBrowserSession())
        );
        if (PREWARM_COMPLETED && prewarmConfigKey.equals(PREWARMED_CONFIG_KEY)) {
            return;
        }
        synchronized (PREWARM_LOCK) {
            if (PREWARM_COMPLETED && prewarmConfigKey.equals(PREWARMED_CONFIG_KEY)) {
                return;
            }
            if (!config.runnerSettings().reuseBrowserSession() || config.parallelThreads() != 1) {
                PREWARMED_CONFIG_KEY = prewarmConfigKey;
                PREWARM_COMPLETED = true;
                return;
            }
            if (PREWARMED_SINGLE_THREAD_UI_ENGINE != null) {
                SHARED_ENGINES.remove(PREWARMED_SINGLE_THREAD_UI_ENGINE);
                try {
                    PREWARMED_SINGLE_THREAD_UI_ENGINE.stop();
                } catch (Exception ignored) {
                }
            }
            UiEngine prewarmedEngine = UiEngineFactory.create(config);
            prewarmedEngine.start();
            PREWARMED_SINGLE_THREAD_UI_ENGINE = prewarmedEngine;
            SHARED_ENGINES.add(prewarmedEngine);
            PREWARMED_CONFIG_KEY = prewarmConfigKey;
            PREWARM_COMPLETED = true;
        }
    }

    private record SharedApiDependencies(
            AuthApiClient authApiClient,
            UserProfileApiClient userProfileApiClient,
            ExpenseApiClient expenseApiClient,
            BudgetApiClient budgetApiClient,
            FriendshipApiClient friendshipApiClient,
            GroupApiClient groupApiClient,
            SharingApiClient sharingApiClient,
            EventApiClient eventApiClient,
            ChatApiClient chatApiClient,
            PresenceApiClient presenceApiClient,
            SessionTokenHelper sessionTokenHelper,
            DefaultTokenProvider tokenProvider,
            ApiEndpointRegistry endpointRegistry,
            ApiRequestExecutor apiRequestExecutor,
            ApiResponseValidator apiResponseValidator,
            JsonSchemaValidator jsonSchemaValidator
    ) {
        private void bind() {
            BddWorld.setAuthApiClient(authApiClient);
            BddWorld.setUserProfileApiClient(userProfileApiClient);
            BddWorld.setExpenseApiClient(expenseApiClient);
            BddWorld.setBudgetApiClient(budgetApiClient);
            BddWorld.setFriendshipApiClient(friendshipApiClient);
            BddWorld.setGroupApiClient(groupApiClient);
            BddWorld.setSharingApiClient(sharingApiClient);
            BddWorld.setEventApiClient(eventApiClient);
            BddWorld.setChatApiClient(chatApiClient);
            BddWorld.setPresenceApiClient(presenceApiClient);
            BddWorld.setSessionTokenHelper(sessionTokenHelper);
            BddWorld.setTokenProvider(tokenProvider);
            BddWorld.setApiEndpointRegistry(endpointRegistry);
            BddWorld.setApiRequestExecutor(apiRequestExecutor);
            BddWorld.setApiResponseValidator(apiResponseValidator);
            BddWorld.setJsonSchemaValidator(jsonSchemaValidator);
        }
    }
}
