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
import com.jaya.automation.api.util.SessionTokenHelper;
import com.jaya.automation.api.validator.ApiResponseValidator;
import com.jaya.automation.bdd.context.AuthProviderFactory;
import com.jaya.automation.bdd.context.BddWorld;
import com.jaya.automation.bdd.context.DependencyGuard;
import com.jaya.automation.bdd.context.ScenarioDataBinder;
import com.jaya.automation.bdd.context.SuiteDataCatalog;
import com.jaya.automation.bdd.context.UiEngineFactory;
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
import io.cucumber.java.Before;
import io.cucumber.java.Scenario;
import org.testng.SkipException;

import java.util.Collection;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

public class ScenarioHooks {
    private static final AutomationLogger LOG = LoggerFactory.getLogger(ScenarioHooks.class);
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
        ApiEndpointRegistry endpointRegistry = new ApiEndpointRegistry();
        BddWorld.setApiEndpointRegistry(endpointRegistry);
        BddWorld.setApiRequestExecutor(new ApiRequestExecutor(config, endpointRegistry));
        BddWorld.setApiResponseValidator(new ApiResponseValidator());
    }

    private void initializeUiFlow(AutomationConfig config) {
        UiEngine uiEngine = UiEngineFactory.create(config);
        uiEngine.start();
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

    private void stopUiEngine() {
        UiEngine uiEngine = BddWorld.testContext().uiEngine();
        if (uiEngine != null) {
            uiEngine.stop();
        }
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
