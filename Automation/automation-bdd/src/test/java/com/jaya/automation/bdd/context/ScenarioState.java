package com.jaya.automation.bdd.context;

import com.jaya.automation.core.context.ScenarioContext;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

public final class ScenarioState {
    private static final String DATA_ROW_KEY = "state.data.row";
    private static final String REQUEST_ALIAS_KEY = "state.alias.request";
    private static final String RESPONSE_ALIAS_KEY = "state.alias.response";
    private static final String SESSION_ALIAS_KEY = "state.alias.session";
    private static final String UI_ALIAS_KEY = "state.alias.ui";
    private static final String VALUE_ALIAS_KEY = "state.alias.value";

    private final ScenarioContext scenarioContext;

    public ScenarioState(ScenarioContext scenarioContext) {
        this.scenarioContext = scenarioContext;
    }

    public void putValue(String key, Object value) {
        scenarioContext.put(key, value);
    }

    public <T> Optional<T> getValue(String key, Class<T> targetType) {
        return scenarioContext.get(key, targetType);
    }

    public void setDataRow(Map<String, String> values) {
        scenarioContext.put(DATA_ROW_KEY, new LinkedHashMap<>(values));
    }

    public Map<String, String> dataRow() {
        return readTextBucket(DATA_ROW_KEY);
    }

    public void putRequestAlias(String alias, Map<String, Object> payload) {
        mutableBucket(REQUEST_ALIAS_KEY).put(alias, new LinkedHashMap<>(payload));
    }

    public Optional<Map<String, Object>> requestAlias(String alias) {
        Object value = readObjectBucket(REQUEST_ALIAS_KEY).get(alias);
        if (!(value instanceof Map<?, ?> values)) {
            return Optional.empty();
        }
        return Optional.of(Collections.unmodifiableMap(copyToObjectMap(values)));
    }

    public void putResponseAlias(String alias, Object responseValue) {
        mutableBucket(RESPONSE_ALIAS_KEY).put(alias, responseValue);
    }

    public Optional<Object> responseAlias(String alias) {
        return Optional.ofNullable(readObjectBucket(RESPONSE_ALIAS_KEY).get(alias));
    }

    public void putAlias(String alias, Object value) {
        mutableBucket(VALUE_ALIAS_KEY).put(alias, value);
    }

    public Optional<Object> aliasValue(String alias) {
        return Optional.ofNullable(readObjectBucket(VALUE_ALIAS_KEY).get(alias));
    }

    public void putSessionValue(String key, String value) {
        mutableTextBucket(SESSION_ALIAS_KEY).put(key, value);
    }

    public Optional<String> sessionValue(String key) {
        return Optional.ofNullable(readTextBucket(SESSION_ALIAS_KEY).get(key));
    }

    public void putUiValue(String key, String value) {
        mutableTextBucket(UI_ALIAS_KEY).put(key, value);
    }

    public Optional<String> uiValue(String key) {
        return Optional.ofNullable(readTextBucket(UI_ALIAS_KEY).get(key));
    }

    public Map<String, String> sessionValues() {
        return Map.copyOf(readTextBucket(SESSION_ALIAS_KEY));
    }

    public Map<String, String> uiValues() {
        return Map.copyOf(readTextBucket(UI_ALIAS_KEY));
    }

    public Map<String, Object> snapshot() {
        return scenarioContext.snapshot();
    }

    private Map<String, String> readTextBucket(String key) {
        return scenarioContext.get(key, Map.class)
                .map(ScenarioState::copyToTextMap)
                .orElseGet(Map::of);
    }

    private Map<String, String> mutableTextBucket(String key) {
        Map<String, String> bucket = scenarioContext.get(key, Map.class)
                .map(ScenarioState::copyToTextMap)
                .orElseGet(LinkedHashMap::new);
        scenarioContext.put(key, bucket);
        return bucket;
    }

    private Map<String, Object> readObjectBucket(String key) {
        return scenarioContext.get(key, Map.class)
                .map(ScenarioState::copyToObjectMap)
                .orElseGet(Map::of);
    }

    private Map<String, Object> mutableBucket(String key) {
        Map<String, Object> bucket = scenarioContext.get(key, Map.class)
                .map(ScenarioState::copyToObjectMap)
                .orElseGet(LinkedHashMap::new);
        scenarioContext.put(key, bucket);
        return bucket;
    }

    private static Map<String, Object> copyToObjectMap(Map<?, ?> source) {
        Map<String, Object> copy = new LinkedHashMap<>();
        source.forEach((mapKey, mapValue) -> copy.put(String.valueOf(mapKey), mapValue));
        return copy;
    }

    private static Map<String, String> copyToTextMap(Map<?, ?> source) {
        Map<String, String> copy = new LinkedHashMap<>();
        source.forEach((mapKey, mapValue) -> copy.put(String.valueOf(mapKey), valueOrEmpty(mapValue)));
        return copy;
    }

    private static String valueOrEmpty(Object value) {
        return value == null ? "" : String.valueOf(value);
    }
}
