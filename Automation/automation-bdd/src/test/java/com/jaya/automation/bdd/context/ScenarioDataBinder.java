package com.jaya.automation.bdd.context;

import com.jaya.automation.core.context.DataTableBinder;
import com.jaya.automation.core.context.DynamicValueResolver;
import io.cucumber.datatable.DataTable;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public final class ScenarioDataBinder {
    private final DataTableBinder dataTableBinder = new DataTableBinder();
    private final DynamicValueResolver valueResolver;

    public ScenarioDataBinder(SuiteDataCatalog suiteDataCatalog) {
        this.valueResolver = new DynamicValueResolver(this::contextValue, this::suiteValue);
        BddWorld.putAliasValue("suite.values", suiteDataCatalog.values());
        suiteDataCatalog.values().forEach((key, value) -> BddWorld.putAliasValue("suite." + key, value));
    }

    public Map<String, String> textMap(DataTable dataTable) {
        return dataTableBinder.bindAsTextMap(dataTable.asMaps(String.class, String.class), valueResolver);
    }

    public List<Map<String, String>> textRows(DataTable dataTable) {
        return dataTableBinder.bindAsTextRows(dataTable.asMaps(String.class, String.class), valueResolver);
    }

    public Map<String, Object> objectMap(DataTable dataTable) {
        return dataTableBinder.bindAsObjectMap(dataTable.asMaps(String.class, String.class), valueResolver);
    }

    public String resolveValue(String value) {
        return valueResolver.resolve(value);
    }

    public Map<String, String> resolveMap(Map<String, String> valueMap) {
        return valueResolver.resolveTextMap(valueMap);
    }

    private Optional<String> contextValue(String key) {
        if (key.startsWith("session.")) {
            return BddWorld.scenarioState().sessionValue(key.substring(8));
        }
        if (key.startsWith("ui.")) {
            return BddWorld.scenarioState().uiValue(key.substring(3));
        }
        if (key.startsWith("data.")) {
            return Optional.ofNullable(BddWorld.dataRow().get(key.substring(5)));
        }
        Optional<Object> aliasValue = BddWorld.aliasValue(key);
        if (aliasValue.isPresent()) {
            return Optional.of(String.valueOf(aliasValue.get()));
        }
        Optional<String> sessionValue = BddWorld.scenarioState().sessionValue(key);
        if (sessionValue.isPresent()) {
            return sessionValue;
        }
        Optional<String> uiValue = BddWorld.scenarioState().uiValue(key);
        if (uiValue.isPresent()) {
            return uiValue;
        }
        String dataValue = BddWorld.dataRow().get(key);
        if (dataValue != null) {
            return Optional.of(dataValue);
        }
        return BddWorld.scenarioState().getValue(key, Object.class).map(String::valueOf);
    }

    private Optional<String> suiteValue(String key) {
        return BddWorld.aliasValue("suite." + key).map(String::valueOf);
    }
}
