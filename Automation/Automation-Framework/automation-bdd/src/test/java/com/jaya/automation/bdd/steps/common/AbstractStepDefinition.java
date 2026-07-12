package com.jaya.automation.bdd.steps.common;

import com.jaya.automation.bdd.context.BddWorld;
import com.jaya.automation.core.config.AutomationConfig;
import com.jaya.automation.core.config.ConfigLoader;
import com.jaya.automation.core.context.TestContext;
import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;
import com.jaya.automation.core.ui.UiEngine;
import io.cucumber.datatable.DataTable;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Abstract base class for all Cucumber step definitions.
 * <p>
 * Adopts the company test-automation {@code AbstractTaskDefinition} pattern:
 * <ul>
 * <li>ThreadLocal {@code Map<String, TestContext>} for ID-based multi-scenario
 * tracking</li>
 * <li>{@link #toTestContext(DataTable)} for DataTable → TestContext conversion
 * keyed by {@code id} column</li>
 * <li>REUSE_ID mechanism for reusing previously stored context across
 * modify/cascade flows</li>
 * </ul>
 * <p>
 * Also provides the existing StepDataSupport utilities: dynamic value
 * resolution,
 * DataTable mapping, and BddWorld integration.
 */
public abstract class AbstractStepDefinition {
    private static final AutomationLogger LOG = LoggerFactory.getLogger(AbstractStepDefinition.class);

    /** Column name for the scenario ID in DataTables */
    protected static final String ID = "id";
    /** Column name for reusing a previous scenario's context */
    protected static final String REUSE_ID = "reuseId";

    /**
     * ThreadLocal map holding TestContext instances keyed by scenario ID.
     * Mirrors company AbstractTaskDefinition's ThreadLocal&lt;Map&lt;String,
     * TestContext&gt;&gt; pattern.
     * Thread-safe for parallel Cucumber execution.
     */
    private static final ThreadLocal<Map<String, TestContext>> TEST_CONTEXT_MAP = ThreadLocal.withInitial(HashMap::new);

    // ── ID-based multi-scenario context management ──

    public static Map<String, TestContext> getTestContextMap() {
        return TEST_CONTEXT_MAP.get();
    }

    public static TestContext getTestContext(String id) {
        return TEST_CONTEXT_MAP.get().get(id);
    }

    public static void setTestContext(String id, TestContext testContext) {
        TEST_CONTEXT_MAP.get().put(id, testContext);
    }

    /**
     * Convert a Cucumber DataTable into the ID-keyed TestContext map.
     * Each row must have an {@code id} column. Known domain columns are mapped
     * to typed fields on TestContext; remaining columns stored in ScenarioContext.
     * <p>
     * If a row includes a {@code reuseId} column, the referenced context's state
     * is copied into the new context before applying overrides.
     * <p>
     * Pattern reference: company
     * {@code AbstractTaskDefinition.toTestContext(DataTable)}
     *
     * @return the full context map (including contexts from prior steps)
     */
    public Map<String, TestContext> toTestContext(DataTable dataTable) {
        List<Map<String, String>> rows = dataTable.asMaps(String.class, String.class);
        Map<String, TestContext> contextMap = TEST_CONTEXT_MAP.get();

        for (Map<String, String> columns : rows) {
            String id = columns.get(ID);
            if (id == null || id.isBlank()) {
                throw new IllegalArgumentException("DataTable row must have a non-empty 'id' column");
            }

            TestContext context;
            if (contextMap.containsKey(id)) {
                context = contextMap.get(id);
            } else {
                context = new TestContext(resolveConfig());
            }

            // REUSE_ID — copy state from a previously stored context
            String reuseId = columns.get(REUSE_ID);
            if (reuseId != null && !reuseId.isBlank()) {
                TestContext sourceContext = contextMap.get(reuseId);
                if (sourceContext != null) {
                    context.copyFrom(sourceContext);
                    context.setReuseId(reuseId);
                    LOG.info("Reused context from '{}' into '{}'", reuseId, id);
                } else {
                    LOG.warn("Reuse ID '{}' not found in context map — skipping copy", reuseId);
                }
            }

            // Apply DataTable column values to the TestContext
            context.applyDataTableColumns(columns);

            // Register in BddWorld for scoped value tracking
            BddWorld.registerScenarioId(id);

            contextMap.put(id, context);
        }

        return contextMap;
    }

    /**
     * Get all reuse TestContext objects referenced by a comma-separated reuseId
     * string.
     * Pattern reference: company
     * {@code ManageOrderHelper.getReuseTestContextObjects}
     */
    public List<TestContext> getReuseTestContextObjects(String reuseIds) {
        if (reuseIds == null || reuseIds.isBlank()) {
            return List.of();
        }
        Map<String, TestContext> contextMap = TEST_CONTEXT_MAP.get();
        return java.util.Arrays.stream(reuseIds.split(","))
                .map(String::trim)
                .filter(id -> !id.isBlank())
                .map(id -> {
                    TestContext ctx = contextMap.get(id);
                    if (ctx == null) {
                        throw new IllegalStateException("Reuse context not found for ID: " + id);
                    }
                    return ctx;
                })
                .toList();
    }

    /**
     * Retrieve the UiEngine (Playwright Page) for a specific scenario ID.
     * Pattern reference: company {@code AbstractTaskDefinition.getPage(id)}
     */
    public UiEngine getUiEngine(String id) {
        TestContext context = getTestContext(id);
        if (context == null) {
            throw new IllegalStateException("No TestContext found for scenario ID: " + id);
        }
        UiEngine engine = context.uiEngine();
        if (engine == null) {
            // Fall back to the BddWorld UiEngine
            engine = BddWorld.testContext().uiEngine();
            if (engine != null) {
                context.setUiEngine(engine);
            }
        }
        return engine;
    }

    /**
     * Clean up ThreadLocal context map. Called from hooks after scenario
     * completion.
     */
    public static void clearContextMap() {
        TEST_CONTEXT_MAP.get().clear();
        TEST_CONTEXT_MAP.remove();
    }

    // ── Dynamic value resolution (existing StepDataSupport methods) ──

    protected String resolveDynamic(String value) {
        return BddWorld.scenarioDataBinder().resolveValue(value);
    }

    protected String dataValue(String key, String fallback) {
        String rawValue = BddWorld.dataRow().get(key);
        if (rawValue == null || rawValue.isBlank()) {
            return resolveDynamic(fallback);
        }
        return resolveDynamic(rawValue);
    }

    protected Map<String, String> textMap(DataTable dataTable) {
        return BddWorld.scenarioDataBinder().textMap(dataTable);
    }

    protected Map<String, Object> objectMap(DataTable dataTable) {
        return BddWorld.scenarioDataBinder().objectMap(dataTable);
    }

    // ── Internal helpers ──

    private AutomationConfig resolveConfig() {
        try {
            return BddWorld.config();
        } catch (IllegalStateException ex) {
            return ConfigLoader.load();
        }
    }
}
