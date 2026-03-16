package com.jaya.automation.bdd.context;

import java.util.Locale;
import java.util.Map;
import java.util.Optional;

public final class ApiScenarioContext {
    private static final String TOKEN_ALIAS_PREFIX = "api.token.alias.";
    private static final String ACTIVE_TOKEN_ALIAS = "api.token.active";

    private final ScenarioState scenarioState;

    public ApiScenarioContext(ScenarioState scenarioState) {
        this.scenarioState = scenarioState;
    }

    public void putRequestAlias(String alias, Map<String, Object> payload) {
        scenarioState.putRequestAlias(alias, payload);
    }

    public Optional<Map<String, Object>> requestAlias(String alias) {
        return scenarioState.requestAlias(alias);
    }

    public void putResponseAlias(String alias, Object value) {
        scenarioState.putResponseAlias(alias, value);
    }

    public Optional<Object> responseAlias(String alias) {
        return scenarioState.responseAlias(alias);
    }

    public void putAlias(String alias, Object value) {
        scenarioState.putAlias(alias, value);
    }

    public Optional<Object> aliasValue(String alias) {
        return scenarioState.aliasValue(alias);
    }

    public void putTokenAlias(String alias, String token) {
        String key = tokenAliasKey(alias);
        scenarioState.putAlias(key, token);
        scenarioState.putSessionValue(key, token);
    }

    public Optional<String> tokenAlias(String alias) {
        String key = tokenAliasKey(alias);
        Optional<Object> aliasValue = scenarioState.aliasValue(key);
        if (aliasValue.isPresent()) {
            return Optional.of(String.valueOf(aliasValue.get()));
        }
        return scenarioState.sessionValue(key);
    }

    public void setActiveTokenAlias(String alias) {
        scenarioState.putSessionValue(ACTIVE_TOKEN_ALIAS, normalize(alias));
    }

    public Optional<String> activeTokenAlias() {
        return scenarioState.sessionValue(ACTIVE_TOKEN_ALIAS);
    }

    private String tokenAliasKey(String alias) {
        return TOKEN_ALIAS_PREFIX + normalize(alias);
    }

    private String normalize(String alias) {
        if (alias == null || alias.isBlank()) {
            return "user";
        }
        return alias.trim().toLowerCase(Locale.ROOT);
    }
}
