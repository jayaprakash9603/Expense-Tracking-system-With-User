package com.jaya.automation.bdd.steps.api;

import com.jaya.automation.bdd.context.BddWorld;
import io.cucumber.java.en.Given;

public class AuthTokenSteps {
    @Given("store response token field {string} as token alias {string}")
    public void storeResponseTokenFieldAsAlias(String tokenJsonPath, String tokenAlias) {
        Object value = BddWorld.apiExecutionResult().jsonPathValue(tokenJsonPath)
                .orElseThrow(() -> new AssertionError("Missing json path: " + tokenJsonPath));
        String token = String.valueOf(value);
        BddWorld.apiScenarioContext().putTokenAlias(tokenAlias, token);
        BddWorld.apiScenarioContext().setActiveTokenAlias(tokenAlias);
        BddWorld.setJwtToken(token);
        BddWorld.putAliasValue("token." + tokenAlias, token);
    }

    @Given("the active token alias is {string}")
    public void setActiveTokenAlias(String tokenAlias) {
        String token = BddWorld.apiScenarioContext().tokenAlias(tokenAlias)
                .orElseGet(() -> BddWorld.tokenProvider().token(tokenAlias));
        BddWorld.apiScenarioContext().putTokenAlias(tokenAlias, token);
        BddWorld.apiScenarioContext().setActiveTokenAlias(tokenAlias);
        BddWorld.setJwtToken(token);
    }
}
