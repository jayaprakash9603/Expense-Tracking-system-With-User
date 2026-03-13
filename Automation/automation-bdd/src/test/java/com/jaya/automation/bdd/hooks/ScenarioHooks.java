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
    private final DependencyGuard dependencyGuard = new DependencyGuard();
    private final ExcelDatasetResolver excelDatasetResolver = new ExcelDatasetResolver();

    @Before(order = 0)
    public void beforeScenario(Scenario scenario) {
        AutomationConfig config = ConfigLoader.load();
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
            dependencyGuard.requireReachable("API_BASE_URL", config.apiBaseUrl());
        }
        if (tags.contains("@ui")) {
            dependencyGuard.requireReachable("BASE_URL", config.baseUrl());
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
        BddWorld.setTokenProvider(new DefaultTokenProvider(config, sessionTokenHelper));
        ApiEndpointRegistry endpointRegistry = new ApiEndpointRegistry();
        BddWorld.setApiEndpointRegistry(endpointRegistry);
        BddWorld.setApiRequestExecutor(new ApiRequestExecutor(config, endpointRegistry));
        BddWorld.setApiResponseValidator(new ApiResponseValidator());
        BddWorld.setJsonSchemaValidator(new JsonSchemaValidator());
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
    }

    private void initializeScenarioData(AutomationConfig config, Scenario scenario) {
        SuiteDataCatalog suiteDataCatalog = new SuiteDataCatalog(config);
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
}
