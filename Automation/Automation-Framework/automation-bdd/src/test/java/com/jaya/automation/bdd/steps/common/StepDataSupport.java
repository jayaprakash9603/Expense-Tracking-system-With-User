package com.jaya.automation.bdd.steps.common;

import com.jaya.automation.bdd.context.BddWorld;
import io.cucumber.datatable.DataTable;

import java.util.Map;

public abstract class StepDataSupport {
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
}
